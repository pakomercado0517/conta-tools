"use client";

import { jsPDF } from "jspdf";
import {
  generateContractContent,
  createLocalDate,
  fechaEnLetras,
  leyendaFechaLugar,
} from "./ContractContent";
import type { ContractData } from "@/schemas";

/* =========================
   Tipos para PDF Generator
   ========================= */

// Tipos para alineación de texto
type TextAlignment = "left" | "center" | "right" | "justify";

// Tipos para estilos de fuente
type FontStyle = "normal" | "bold" | "italic";

// Token para renderizado de texto con estilos
interface TextToken {
  text: string;
  style: FontStyle;
}

// Props del componente principal
interface ContractPDFGeneratorProps {
  contractData: ContractData;
  fileName?: string;
}

/* =========================
   Generador de PDF
   ========================= */

/**
 * Genera un PDF del contrato de prestación de servicios
 * @param contractData - Datos del contrato
 * @returns Documento PDF generado
 */
export function generateContractPDF(contractData: ContractData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const lineHeight = 6;
  let yPosition = margin;

  // Generar contenido del contrato usando las utilidades reutilizables
  const content = generateContractContent(contractData);

  // ===== Helper: addText con soporte **negritas** dentro del mismo párrafo =====
  const addText = (
    text: string,
    fontSize: number = 10,
    isBold: boolean = false,
    align: TextAlignment = "left"
  ): void => {
    const defaultStyle: FontStyle = isBold ? "bold" : "normal";
    const usableWidth = pageWidth - 2 * margin;

    /**
     * Asegurar que hay espacio suficiente en la página
     */
    const ensurePageSpace = (): void => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    /**
     * Medir el ancho de un texto con un estilo específico
     */
    const measure = (txt: string, style: FontStyle): number => {
      doc.setFont("helvetica", style);
      return doc.getTextWidth(txt);
    };

    /**
     * Tokenizar un párrafo separando texto normal de texto en negritas
     */
    const tokenizeParagraph = (paragraph: string): TextToken[] => {
      const parts = paragraph.split(/(\*\*.*?\*\*)/g).filter(Boolean);
      const tokens: TextToken[] = [];

      parts.forEach((part, idx) => {
        const isMarkdownBold = part.startsWith("**") && part.endsWith("**");
        let clean = isMarkdownBold ? part.slice(2, -2) : part;

        // 👇 Para palabras en negrita, asegurar espacios correctos
        if (isMarkdownBold) {
          // Añadir espacio al principio si hay contenido previo y no termina en espacio
          const prevPart = idx > 0 ? parts[idx - 1] : null;
          if (prevPart && !prevPart.endsWith(" ") && !clean.startsWith(" ")) {
            clean = " " + clean;
          }

          // Añadir espacio al final si hay contenido siguiente y no empieza en espacio
          const nextPart = idx < parts.length - 1 ? parts[idx + 1] : null;
          if (nextPart && !nextPart.startsWith(" ") && !clean.endsWith(" ")) {
            clean = clean + " ";
          }
        }

        // Dividir en palabras y crear tokens
        const words = clean.split(/(\s+)/);
        words.forEach((word) => {
          if (word.length > 0) {
            tokens.push({
              text: word,
              style: isMarkdownBold ? "bold" : defaultStyle,
            });
          }
        });
      });

      if (tokens.length === 0) tokens.push({ text: "", style: defaultStyle });
      return tokens;
    };

    /**
     * Renderizar una línea de tokens con el estilo y alineación correspondiente
     */
    const renderLine = (
      lineTokens: TextToken[],
      y: number,
      alignMode: "left" | "center" | "justify" = "left",
      isLastLine: boolean = false
    ): void => {
      // Calcular ancho total de la línea
      let lineWidth = 0;
      lineTokens.forEach((t) => {
        lineWidth += measure(t.text, t.style);
      });

      // Separar palabras de espacios para justificación
      const wordTokens = lineTokens.filter(
        (t) => !/^\s+$/.test(t.text) && t.text !== " "
      );
      const totalWords = wordTokens.length;

      let startX = margin;
      let extraSpacePerGap = 0;

      if (alignMode === "center") {
        startX = margin + (usableWidth - lineWidth) / 2;
      } else if (alignMode === "justify" && !isLastLine && totalWords > 1) {
        // Calcular ancho de solo las palabras
        const wordsWidth = wordTokens.reduce(
          (sum, t) => sum + measure(t.text, t.style),
          0
        );
        // Calcular espacio disponible para distribuir entre palabras
        const availableSpace = usableWidth - wordsWidth;
        const spaceCount = totalWords - 1;
        extraSpacePerGap = availableSpace / spaceCount;
      }

      let x = startX;
      let wordCount = 0;

      lineTokens.forEach((t) => {
        const isSpace = /^\s+$/.test(t.text) || t.text === " ";
        const tokenWidth = measure(t.text, t.style);

        if (!isSpace) {
          // Renderizar palabra
          doc.setFont("helvetica", t.style);
          doc.text(t.text, x, y);
          x += tokenWidth;
          wordCount++;

          // Agregar espacio justificado después de cada palabra (excepto la última)
          if (
            alignMode === "justify" &&
            !isLastLine &&
            wordCount < totalWords
          ) {
            x += extraSpacePerGap;
          }
        } else if (alignMode !== "justify" || isLastLine) {
          // Renderizar espacio normalmente si no estamos justificando o es la última línea
          doc.setFont("helvetica", t.style);
          doc.text(t.text, x, y);
          x += tokenWidth;
        }
        // Si estamos justificando y no es la última línea, no renderizamos los espacios
      });
    };

    doc.setFontSize(fontSize);
    const paragraphs = String(text).split("\n");

    paragraphs.forEach((p, pIdx) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      const tokens = tokenizeParagraph(p);

      const lines: TextToken[][] = [];
      let currentLine: TextToken[] = [];
      let currentWidth = 0;

      tokens.forEach((tok) => {
        const w = measure(tok.text, tok.style);
        if (currentWidth + w > usableWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = [tok];
          currentWidth = w;
        } else {
          currentLine.push(tok);
          currentWidth += w;
        }
      });
      if (currentLine.length > 0) lines.push(currentLine);

      lines.forEach((line, lineIdx) => {
        ensurePageSpace();
        const mode: "left" | "center" | "justify" =
          align === "center"
            ? "center"
            : align === "justify"
              ? "justify"
              : "left";
        const isLastLine = lineIdx === lines.length - 1;
        renderLine(line, yPosition, mode, isLastLine);
        yPosition += lineHeight;
      });

      if (pIdx === paragraphs.length - 1) {
        yPosition += lineHeight;
      }
    });
  };

  /**
   * Añadir espacio vertical
   */
  const addSpace = (space: number = lineHeight): void => {
    yPosition += space;
  };

  // ====== Contenido ======

  // Título
  addText(content.terminoTitulo, 16, true, "center");
  addSpace(10);

  // Introducción
  const introText = `QUE CELEBRAN POR UNA PARTE **${content.prestadorNombre}**${content.representanteVendedor}, A QUIEN EN LO SUCESIVO SE LE DENOMINARÁ COMO **"${content.terminoVendedor}"**, POR LA OTRA PARTE **${content.clienteNombre}**${content.representanteCliente}, A QUIEN EN LO SUCESIVO SE LE DENOMINARÁ COMO **"EL CLIENTE"**, Y A QUIENES DE MANERA CONJUNTA SE LES DENOMINARÁN COMO **"LAS PARTES"** AL TENOR DE LAS SIGUIENTES DECLARACIONES Y CLÁUSULAS:`;
  addText(introText, 10, false, "justify");
  addSpace();

  // DECLARACIONES
  addText("DECLARACIONES", 12, true, "center");
  addSpace();

  // Declaración del VENDEDOR
  addText(
    `I. Declara **${content.terminoVendedor}**, por conducto de sus representantes legales que:`,
    10,
    false,
    "justify"
  );
  addSpace(3);

  addText(
    `**A.** Es una ${content.regimenVendedor?.toLowerCase() || "[régimen]"} debidamente constituida de conformidad con las leyes de los Estados Unidos Mexicanos.`,
    10,
    false,
    "justify"
  );
  addSpace(3);

  if (content.representantePrestador) {
    addText(
      `**B.** Sus representantes legales cuentan con las facultades necesarias para suscribir el presente Contrato.`,
      10,
      false,
      "justify"
    );
    addSpace(3);
  }

  addText(
    `**${content.representantePrestador ? "C" : "B"}.** Tiene su domicilio en **${content.domicilioPrestador || `[DOMICILIO COMPLETO DEL ${content.terminoVendedorMin.toUpperCase()}]`}**.`,
    10,
    false,
    "justify"
  );
  addSpace(3);

  addText(
    `**${content.representantePrestador ? "D" : "C"}.** Es su deseo ${content.terminoObjetivo}, sin reserva y limitación alguna y libre de cualquier gravamen u otra limitación de dominio al **CLIENTE** los materiales/servicios que se describen en la cláusula primera del presente Contrato.`,
    10,
    false,
    "justify"
  );
  addSpace();

  // Declaración del CLIENTE
  addText(
    "II. DECLARA **EL CLIENTE**, POR CONDUCTO DE SU REPRESENTANTE LEGAL:",
    10,
    false,
    "justify"
  );
  addSpace(3);

  addText(
    `**A.** Es una ${content.regimenComprador?.toLowerCase() || "[régimen]"}${content.textoConstitucion} de conformidad con las leyes de los Estados Unidos Mexicanos.`,
    10,
    false,
    "justify"
  );
  addSpace(3);

  if (content.representanteCliente) {
    addText(
      `**B.** Su representante legal cuenta con las facultades necesarias para suscribir el presente Contrato.`,
      10,
      false,
      "justify"
    );
    addSpace(3);
  }

  addText(
    `**${content.representanteCliente ? "C" : "B"}.** Tiene su domicilio en **${content.domicilioCliente || "[DOMICILIO COMPLETO DEL CLIENTE]"}**.`,
    10,
    false,
    "justify"
  );
  addSpace(3);

  addText(
    `**${content.representanteCliente ? "D" : "C"}.** Es su deseo adquirir la propiedad plena de los materiales/servicios en los términos y condiciones que se establecen en el presente Contrato.`,
    10,
    false,
    "justify"
  );
  addSpace(3);

  addText(
    `**${content.representanteCliente ? "E" : "D"}.** Que cumple con todas sus obligaciones de carácter laboral y de seguridad social, permisos y demás relativos aplicables de la Legislación vigente en los Estados Unidos Mexicanos.`,
    10,
    false,
    "justify"
  );
  addSpace();

  addText(
    "De conformidad con las Declaraciones anteriores, Las Partes convienen en otorgar las siguientes:",
    10,
    false,
    "justify"
  );
  addSpace();

  // CLÁUSULAS
  addText("CLÁUSULAS", 12, true, "center");
  addSpace();

  // PRIMERA - Objeto
  addText("**PRIMERA. OBJETO:**", 11, true);
  addText(
    `**${content.terminoVendedor}** se obliga a ${content.esServicio ? "prestar los servicios" : "transmitir la propiedad sin reserva de dominio, libre de gravamen y limitación alguna"} de los ${content.esServicio ? "servicios" : "materiales/servicios"} consistentes en: **${content.servicios || "[DESCRIPCIÓN DETALLADA DE MATERIALES/SERVICIOS]"}** al **CLIENTE**, quien sabe y conoce plenamente las condiciones en que se encuentran los ${content.esServicio ? "servicios" : "materiales/servicios"}, y quien deberá pagar la contraprestación prevista en la cláusula Segunda.`,
    10,
    false,
    "justify"
  );
  addSpace();

  // SEGUNDA - Precio y Pago
  addText("**SEGUNDA. PRECIO Y PAGO:**", 11, true);

  addText(
    `Las Partes acuerdan que el precio total de los materiales/servicios será de **${content.montoTotalText}${content.montoTextoCompleto}**, del cual se incluye el **16% (dieciséis por ciento)** de **IVA**.`,
    10,
    false,
    "justify"
  );
  addSpace(3);

  // Condiciones de pago según el tipo seleccionado
  const tipoPago = content.tipoPago || "una_exhibicion";
  const metodoPagoText = content.formaPago || "[MÉTODO DE PAGO]";

  if (tipoPago === "una_exhibicion") {
    // Pago en una sola exhibición - mostrar forma de pago y método de pago
    addText(
      `**Forma de pago:** Pago en una sola exhibición`,
      10,
      false,
      "justify"
    );
    addSpace(3);
    addText(`**Método de pago:** ${metodoPagoText}`, 10, false, "justify");
    addSpace(3);
  } else if (tipoPago === "parcialidades") {
    // Pago en parcialidades - mostrar forma de pago, condiciones y método de pago
    addText(`**Forma de pago:** Pago en parcialidades`, 10, false, "justify");
    addSpace(3);

    const condicionesPago = content.condicionesPago || "[CONDICIONES DE PAGO]";
    addText(
      `**Condiciones de pago:** ${condicionesPago}`,
      10,
      false,
      "justify"
    );
    addSpace(3);

    addText(`**Método de pago:** ${metodoPagoText}`, 10, false, "justify");
    addSpace(3);
  } else if (tipoPago === "otro") {
    // Otro tipo de pago - solo condiciones de pago y método de pago (sin Forma de pago)
    const condicionesPago = content.condicionesPago || "[CONDICIONES DE PAGO]";

    addText(
      `**Condiciones de pago:** ${condicionesPago}`,
      10,
      false,
      "justify"
    );
    addSpace(3);

    addText(`**Método de pago:** ${metodoPagoText}`, 10, false, "justify");
    addSpace(3);
  }

  // Datos bancarios si están disponibles
  if (
    content.banco ||
    content.titularCuenta ||
    content.numeroCuenta ||
    content.clabeInterbancaria
  ) {
    addText(
      `Las Partes acuerdan que previo al retiro de los materiales/servicios, **EL CLIENTE** deberá depositar el pago a la siguiente cuenta:`,
      10,
      false,
      "justify"
    );
    addSpace(3);

    if (content.banco) {
      addText(`- **Banco:**  ${content.banco}`, 10, false);
    }
    if (content.titularCuenta) {
      addText(
        `- **Titular de la cuenta:**  ${content.titularCuenta}`,
        10,
        false
      );
    }
    if (content.numeroCuenta) {
      addText(`- **Número de cuenta:**  ${content.numeroCuenta}`, 10, false);
    }
    if (content.clabeInterbancaria) {
      addText(
        `- **CLABE interbancaria:**  ${content.clabeInterbancaria}`,
        10,
        false
      );
    }
  }

  // Compromiso de facturación (siempre se incluye)
  addText(
    `**RECIBOS Y FACTURACION. ${content.terminoVendedor}**  se compromete a emitir los  **recibos o facturas fiscales**  correspondientes por cada pago recibido, conforme a lo estipulado por las leyes fiscales vigentes.`,
    10,
    false,
    "justify"
  );
  addSpace();

  // TERCERA - Vigencia
  addText("**TERCERA. VIGENCIA:**", 11, true);

  // Fechas en letra (corrigiendo problemas de zona horaria)
  const fechaInicioBase = contractData.fechaInicio
    ? createLocalDate(contractData.fechaInicio)
    : null;
  const fechaInicioStr = fechaInicioBase
    ? fechaEnLetras(fechaInicioBase)
    : "[FECHA DE INICIO]";

  let fechaTerminoStr = "[FECHA DE TÉRMINO]";
  if (contractData.fechaTermino === "otro") {
    fechaTerminoStr = contractData.fechaTerminoTexto || "[ESPECIFICAR TÉRMINO]";
  } else if (contractData.fechaTermino) {
    const f = createLocalDate(contractData.fechaTermino);
    fechaTerminoStr = f ? fechaEnLetras(f) : "[FECHA DE TÉRMINO]";
  }

  const vigenciaText = `El presente Contrato tendrá vigencia necesaria y suficiente para soportar la presente ${content.esServicio ? "prestación de servicios" : "compraventa"}, misma que deberá realizarse en el periodo que va del **${fechaInicioStr}** al **${fechaTerminoStr}**.`;
  addText(vigenciaText, 10, false, "justify");
  addSpace();

  // CUARTA - Responsabilidad Laboral
  addText("**CUARTA. RESPONSABILIDAD LABORAL:**", 11, true);
  const obligacionesText =
    "Las Partes integrantes del presente Contrato son independientes entre sí y por ningún motivo serán consideradas como agentes o representantes, trabajadores o empleados de la otra. Cada una se responsabilizará de sus propias acciones y obligaciones con respecto a sus empleados. Las Partes asumen toda la responsabilidad derivada de la relación de trabajo con sus propios empleados, trabajadores o dependientes.";
  addText(obligacionesText, 10, false, "justify");
  addSpace();

  // QUINTA - Jurisdicción
  addText("**QUINTA. JURISDICCIÓN:**", 11, true);
  const jurisdiccionText = `Para la interpretación y cumplimiento del presente Contrato, las Partes se someten a la jurisdicción de los tribunales competentes en **${contractData.jurisdiccion || "[CIUDAD/ESTADO]"}**, renunciando expresamente a cualquier otro fuero que por razón de sus domicilios presentes o futuros les pudiera corresponder o por cualquier otra causa.`;
  addText(jurisdiccionText, 10, false, "justify");
  addSpace(5);

  // Firma (en letras con ciudad)
  const fechaFirmaBase = contractData.fechaFirma
    ? createLocalDate(contractData.fechaFirma)
    : new Date();
  const ciudadFirma = contractData.ciudadFirma || "[CIUDAD]";
  const fechaFirmaFinal = fechaFirmaBase || new Date(); // Garantizar que nunca sea null
  const firmaText = `Leído que fue el presente Contrato y enteradas las Partes de su contenido y alcance legal, lo firman por duplicado en **${leyendaFechaLugar(ciudadFirma, fechaFirmaFinal)}**.`;
  addText(firmaText, 10, false, "justify");
  addSpace(4);

  // Nombres para las firmas
  const nombreVendedor = (
    contractData.prestador || "[NOMBRE DEL VENDEDOR]"
  ).toUpperCase();
  const nombreCliente = (
    contractData.cliente || "[NOMBRE DEL CLIENTE]"
  ).toUpperCase();

  // Verificar si hay espacio suficiente para las firmas (aproximadamente 120px)
  if (yPosition > pageHeight - 120) {
    doc.addPage();
    yPosition = margin + 20;
  }

  // Sección de firmas siguiendo el formato de la imagen
  const centerX = pageWidth / 2;

  // EL CLIENTE (arriba, centrado)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("EL CLIENTE", centerX, yPosition, { align: "center" });

  yPosition += 8;

  // Imagen de firma del cliente si existe
  if (contractData.imagenFirmaComprador) {
    try {
      doc.addImage(
        contractData.imagenFirmaComprador,
        "PNG",
        centerX - 12,
        yPosition,
        24,
        15
      );
      yPosition += 18;
    } catch (error) {
      console.log("Error adding cliente signature image:", error);
      yPosition += 12;
    }
  } else {
    yPosition += 12;
  }

  // Línea de firma del cliente
  const lineLength = 40;
  const startX = centerX - lineLength / 2;
  const endX = centerX + lineLength / 2;
  doc.line(startX, yPosition, endX, yPosition);

  yPosition += 6;

  // Nombre del cliente
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(nombreCliente, centerX, yPosition, { align: "center" });

  // Representante del cliente si existe
  if (contractData.representanteCliente) {
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
      contractData.representanteCliente.toUpperCase(),
      centerX,
      yPosition,
      { align: "center" }
    );
    yPosition += 4;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(6);
    doc.text(`Representante Legal`, centerX, yPosition, { align: "center" });
  }

  yPosition += 20;

  // Verificar si hay espacio para EL VENDEDOR, si no, nueva página
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = margin + 20;
  }

  // VENDEDOR/PRESTADOR (abajo, centrado)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(content.terminoVendedor, centerX, yPosition, { align: "center" });

  yPosition += 8;

  // Imagen de firma del vendedor si existe
  if (contractData.imagenFirmaVendedor) {
    try {
      doc.addImage(
        contractData.imagenFirmaVendedor,
        "PNG",
        centerX - 12,
        yPosition,
        24,
        15
      );
      yPosition += 18;
    } catch (error) {
      console.log("Error adding vendedor signature image:", error);
      yPosition += 12;
    }
  } else {
    yPosition += 12;
  }

  // Línea de firma del vendedor
  doc.line(startX, yPosition, endX, yPosition);

  yPosition += 6;

  // Nombre del vendedor
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(nombreVendedor, centerX, yPosition, { align: "center" });

  // Representante del vendedor si existe
  if (contractData.representantePrestador) {
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
      contractData.representantePrestador.toUpperCase(),
      centerX,
      yPosition,
      { align: "center" }
    );
    yPosition += 4;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(6);
    doc.text(`Representante Legal`, centerX, yPosition, { align: "center" });
  }

  return doc;
}

/**
 * Componente para descargar el contrato como PDF
 * Proporciona un botón que genera y descarga el PDF del contrato
 */
export default function ContractPDFGenerator({
  contractData,
  fileName = "contrato_compraventa_materiales_servicios.pdf",
}: ContractPDFGeneratorProps) {
  /**
   * Maneja la descarga del PDF del contrato
   */
  const handleDownload = (): void => {
    try {
      const doc = generateContractPDF(contractData);
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF del contrato");
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="focus:shadow-outline rounded bg-green-600 px-4 py-2 font-bold text-white transition-colors hover:bg-green-700 focus:outline-none"
      type="button"
    >
      Descargar Contrato PDF
    </button>
  );
}
