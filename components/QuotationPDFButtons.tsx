"use client";

import { useState, ChangeEvent } from "react";
import { Button, FileInput, Label } from "flowbite-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useFormatNumber from "@/hooks/useFormatNumber";
import { numeroALetras } from "@/lib/numero-letras-mx";
import { formatConceptText } from "@/lib/formatConceptText";
import {
  ensureJsPdfUnicodeFont,
  JSPDF_UNICODE_FONT,
  setJsPdfUnicodeFont,
} from "@/lib/jspdfUnicodeFont";
import type {
  QuotationPDFButtonsProps,
  BankData,
  QuotationProduct,
  QuotationTaxLine,
} from "@/types/quotation";

type JsPDFWithPrevTable = jsPDF & {
  previousAutoTable?: { finalY: number };
};

function parsePrecioUnitario(v: string | number): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const s = String(v).trim();
  if (s === "") return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
}

function parseCantidad(v: string | number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatPrecioCell(
  v: string | number,
  formatNumber: Intl.NumberFormat
): string {
  const p = parsePrecioUnitario(v);
  if (p === null) return "";
  return formatNumber.format(p);
}

function formatTotalCell(
  producto: QuotationProduct,
  formatNumber: Intl.NumberFormat
): string {
  const p = parsePrecioUnitario(producto.precioUnitario);
  if (p === null) return "";
  const q = parseCantidad(producto.cantidad);
  return formatNumber.format(q * p);
}

/** Importe de línea para subtotal e impuestos: solo si precio numérico > 0. */
function lineTaxBase(producto: QuotationProduct): number {
  const p = parsePrecioUnitario(producto.precioUnitario);
  if (p === null || p <= 0) return 0;
  return parseCantidad(producto.cantidad) * p;
}

function computeTaxMonto(base: number, tax: QuotationTaxLine): number | null {
  if (base <= 0) return null;
  const raw = String(tax.valor ?? "").trim();
  if (raw === "") return null;
  const valor = Number(raw);
  if (!Number.isFinite(valor) || valor < 0) return null;
  if (tax.modo === "porcentaje") {
    return base * (valor / 100);
  }
  return valor;
}

interface AggTaxRow {
  etiqueta: string;
  tipo: "impuesto" | "retencion";
  monto: number;
  /** Cuántas aplicaciones del concepto se sumaron (una o más líneas de producto). */
  fuentes: number;
}

function aggregateTaxes(productos: QuotationProduct[]): {
  orderedKeys: string[];
  map: Map<string, AggTaxRow>;
} {
  const map = new Map<string, AggTaxRow>();
  const orderedKeys: string[] = [];

  for (const producto of productos) {
    const base = lineTaxBase(producto);
    if (base <= 0) continue;
    const taxes = producto.impuestosLinea ?? [];
    for (const tax of taxes) {
      const monto = computeTaxMonto(base, tax);
      if (monto === null || monto < 1e-9) continue;
      const valorNorm = String(tax.valor ?? "").trim();
      const key = `${tax.etiqueta}|${tax.tipo}|${tax.modo}|${valorNorm}`;
      const prev = map.get(key);
      if (prev) {
        prev.monto += monto;
        prev.fuentes += 1;
      } else {
        map.set(key, {
          etiqueta: (tax.etiqueta ?? "").trim() || "(Sin etiqueta)",
          tipo: tax.tipo,
          monto,
          fuentes: 1,
        });
        orderedKeys.push(key);
      }
    }
  }

  return { orderedKeys, map };
}

/** Etiqueta en PDF: categoría + texto del usuario (ej. «Impuesto IVA», «Impuestos IVA» si agrupa varias líneas). */
function etiquetaFiscalPdf(
  tipo: "impuesto" | "retencion",
  etiquetaUsuario: string,
  fuentes: number
): string {
  const texto = etiquetaUsuario.trim();
  const parteUsuario = texto.length > 0 ? texto : "(Sin etiqueta)";
  const plural = fuentes > 1;
  if (tipo === "impuesto") {
    const cat = plural ? "Impuestos" : "Impuesto";
    return `${cat} ${parteUsuario}`;
  }
  const cat = plural ? "Retenciones" : "Retención";
  return `${cat} ${parteUsuario}`;
}

/**
 * Componente para generar y previsualizar PDFs de cotización
 * Incluye funcionalidad para cargar firma digital y generar PDF
 *
 * @param datos - Datos del formulario de cotización
 * @param setPdfDataUrl - Función para establecer URL del PDF para preview
 * @param dataBank - Datos bancarios opcionales
 */
export default function QuotationPDFButtons({
  datos,
  setPdfDataUrl,
  dataBank,
}: QuotationPDFButtonsProps) {
  const [firmaImg, setFirmaImg] = useState<string | null>(null);

  const formatNumber = useFormatNumber();

  // Meses en español para formato de fecha
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  /**
   * Formatear fecha para mostrar en el documento
   */
  const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha);
    const dia = date.getUTCDate();
    const mes = meses[date.getUTCMonth()];
    const año = date.getUTCFullYear();
    return `${datos.lugar}. A ${dia} de ${mes} del ${año}.`;
  };

  /**
   * Formatear fecha para nombre de archivo
   */
  const formatearFechaParaArchivo = (fecha: string): string => {
    const date = new Date(fecha);
    const dia = date.getUTCDate().toString().padStart(2, "0");
    const mes = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const año = date.getUTCFullYear();
    return `${dia}-${mes}-${año}`;
  };

  /**
   * Obtener primeras tres palabras del concepto para nombre de archivo
   */
  const obtenerPrimerasTresPalabrasConcepto = (): string => {
    if (
      datos.productos &&
      datos.productos.length > 0 &&
      datos.productos[0].descripcion
    ) {
      return datos.productos[0].descripcion
        .trim()
        .split(/\s+/)
        .slice(0, 3)
        .join(" ");
    }
    return "Cotización";
  };

  /**
   * Manejar carga de imagen de firma
   */
  const handleFirmaChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setFirmaImg(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  /**
   * Generar PDF con jsPDF
   * @param btnFunc - 'preview' para previsualizar, undefined para descargar
   */
  const generarPDF = async (btnFunc?: string): Promise<void> => {
    const doc = new jsPDF();
    await ensureJsPdfUnicodeFont(doc);
    setJsPdfUnicodeFont(doc, "normal");

    const pageWidth = doc.internal.pageSize.getWidth();

    const contacto = `Tel: ${datos.telefono} | Email: ${datos.email}`;
    const logoWidth = 30;
    const logoHeight = 30;

    // Logo del encabezado
    if (datos.logoEmpresa) {
      doc.addImage(datos.logoEmpresa, "PNG", 10, 2, logoWidth, logoHeight);
    }

    // Encabezado centrado
    doc.setFontSize(16);
    doc.setTextColor(96, 96, 96); // Gris oscuro
    doc.text(datos.empresa, pageWidth / 2, 10, { align: "center" });
    doc.setFontSize(10);
    doc.text(String(datos.rfc).toUpperCase(), pageWidth / 2, 15, {
      align: "center",
    });
    doc.text(datos.domicilio, pageWidth / 2, 20, { align: "center" });
    doc.text(contacto, pageWidth / 2, 25, { align: "center" });

    // Lugar y fecha: 12 mm bajo la última línea del encabezado (contacto, y=25)
    const encabezadoUltimaY = 25;
    const espacioEncabezadoFechaMm = 12;
    const fechaY = encabezadoUltimaY + espacioEncabezadoFechaMm;
    const fechaFormateada = formatearFecha(datos.fecha);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Negro
    doc.text(fechaFormateada, pageWidth - 20, fechaY, { align: "right" });

    /** Hueco entre la fecha y «a quién va dirigido» (mm desde baseline de la fecha). */
    const espacioFechaDestinatarioMm = 14;

    // A quién va dirigido (cuerpo: 11 pt)
    doc.setFontSize(11);
    const destinatarioEmpresaY = fechaY + espacioFechaDestinatarioMm;
    doc.text(`${datos.destinatarioEmpresa}.`, 12, destinatarioEmpresaY);
    doc.text(`${datos.destinatario}.`, 12, destinatarioEmpresaY + 6);

    // Saludo y descripción opcional del servicio (antes de la tabla; cuerpo: 11 pt)
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    setJsPdfUnicodeFont(doc, "normal");
    const textMarginX = 20;
    const textMaxWidth = pageWidth - textMarginX - 12;
    const bodyLineHeight = 6;
    const pageMaxY = 270;

    let bodyY = destinatarioEmpresaY + 6 + 9;
    const saludoLines = doc.splitTextToSize(datos.saludo ?? "", textMaxWidth);

    const advancePastLines = (lines: string[], extraGap: number): void => {
      const blockHeight = lines.length * bodyLineHeight;
      if (bodyY + blockHeight > pageMaxY) {
        doc.addPage();
        bodyY = 20;
      }
      doc.text(lines, textMarginX, bodyY);
      bodyY += blockHeight + extraGap;
    };

    advancePastLines(saludoLines, 6);

    if (
      datos.incluirDescripcionServicio &&
      datos.descripcionServicio.trim() !== ""
    ) {
      setJsPdfUnicodeFont(doc, "bold");
      const physicalLines = datos.descripcionServicio.split(/\r?\n/);
      for (const rawLine of physicalLines) {
        if (rawLine.trim() === "") {
          bodyY += 4;
          continue;
        }
        const wrapped = doc.splitTextToSize(
          formatConceptText(rawLine.trim()),
          textMaxWidth
        );
        advancePastLines(wrapped, 3);
      }
      bodyY += 2;
      setJsPdfUnicodeFont(doc, "normal");
    }

    const tableStartY = bodyY + 2;

    const { orderedKeys, map: aggTaxMap } = aggregateTaxes(datos.productos);
    const subtotal = datos.productos.reduce((s, p) => s + lineTaxBase(p), 0);

    let sumImpuestos = 0;
    let sumRetenciones = 0;
    for (const key of orderedKeys) {
      const row = aggTaxMap.get(key);
      if (!row) continue;
      if (row.tipo === "impuesto") sumImpuestos += row.monto;
      else sumRetenciones += row.monto;
    }

    const totalFinal =
      Math.round((subtotal + sumImpuestos - sumRetenciones) * 100) / 100;

    const etiquetaSubtotal =
      (datos.etiquetaSubtotal ?? "Subtotal:").trim() || "Subtotal:";
    const etiquetaTotal = (datos.etiquetaTotal ?? "Total:").trim() || "Total:";
    const prefijoCantidadLetra =
      (datos.textoCantidadLetra ?? "").trim() || "Importe con letra:";
    const letrasTotal = numeroALetras(totalFinal);
    const textoCantidadCompleto =
      letrasTotal != null
        ? `${prefijoCantidadLetra} ${letrasTotal.charAt(0).toUpperCase() + letrasTotal.slice(1)}`
        : `${prefijoCantidadLetra} (Monto no disponible en letras)`;

    const taxFooterRows = orderedKeys.flatMap((key) => {
      const row = aggTaxMap.get(key);
      if (!row) return [];
      return [
        [
          {
            content: etiquetaFiscalPdf(row.tipo, row.etiqueta, row.fuentes),
            colSpan: 4,
            styles: { fontStyle: "bold", halign: "right" as const },
          },
          formatNumber.format(row.monto),
        ],
      ];
    });

    // Tabla de productos + resumen
    doc.autoTable({
      startY: tableStartY,
      head: [["Cantidad", "Unidad", "Descripción", "Precio Unitario", "Total"]],
      body: [
        ...datos.productos.map((producto) => [
          String(producto.cantidad),
          formatConceptText(producto.unidad),
          formatConceptText(producto.descripcion),
          formatPrecioCell(producto.precioUnitario, formatNumber),
          formatTotalCell(producto, formatNumber),
        ]),
        [
          {
            content: "",
            colSpan: 5,
            styles: { minCellHeight: 10, halign: "center" },
          },
        ],
        [
          {
            content: etiquetaSubtotal,
            colSpan: 4,
            styles: { fontStyle: "bold", halign: "right" },
          },
          formatNumber.format(subtotal),
        ],
        ...taxFooterRows,
        [
          {
            content: etiquetaTotal,
            colSpan: 4,
            styles: { fontStyle: "bold", halign: "right" },
          },
          formatNumber.format(totalFinal),
        ],
        [
          {
            content: textoCantidadCompleto,
            colSpan: 5,
            styles: {
              fontStyle: "normal",
              fontSize: 10,
              cellPadding: 3,
              valign: "middle",
            },
          },
        ],
      ],
      headStyles: {
        fillColor: [54, 69, 79],
        fontSize: 11,
        font: JSPDF_UNICODE_FONT,
      },
      styles: { fontSize: 11, font: JSPDF_UNICODE_FONT },
    });

    const prevTable = (doc as JsPDFWithPrevTable).previousAutoTable;
    const finalYBase = prevTable?.finalY;
    if (finalYBase === undefined) {
      throw new Error("No se pudo obtener la posición tras autoTable");
    }
    let finalY = finalYBase + 10;

    const clauseLineHeight = 6;
    /** Espacio compacto entre bloques (cláusulas → bancarios → despedida). */
    const sectionGap = 5;
    const breakPageIfNeeded = (): void => {
      if (finalY > 270) {
        doc.addPage();
        finalY = 20;
      }
    };

    // Cláusulas (título y asteriscos en negrita; cuerpo 11 pt)
    breakPageIfNeeded();
    finalY += 6;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    setJsPdfUnicodeFont(doc, "bold");
    doc.text("Cláusulas:", 12, finalY);
    setJsPdfUnicodeFont(doc, "normal");
    finalY += clauseLineHeight + 2;

    datos.clausulas.forEach((rawClausula) => {
      const trimmed = rawClausula.trim();
      if (!trimmed) return;

      doc.setFontSize(11);
      setJsPdfUnicodeFont(doc, "bold");
      const starStr = "* ";
      const clauseStarX = 12;
      const textLeft = clauseStarX + doc.getTextWidth(starStr);
      const clauseMarginRight = 14;
      const maxClauseWidth = Math.max(
        24,
        pageWidth - textLeft - clauseMarginRight
      );
      setJsPdfUnicodeFont(doc, "normal");
      const lines = doc.splitTextToSize(trimmed, maxClauseWidth);

      lines.forEach((line: string, idx: number) => {
        breakPageIfNeeded();
        if (idx === 0) {
          setJsPdfUnicodeFont(doc, "bold");
          doc.text(starStr, clauseStarX, finalY);
          setJsPdfUnicodeFont(doc, "normal");
          doc.text(line, textLeft, finalY);
        } else {
          setJsPdfUnicodeFont(doc, "normal");
          doc.text(line, textLeft, finalY);
        }
        finalY += clauseLineHeight;
      });
      finalY += 1;
    });

    // Datos bancarios (si se requiere…) — mismo criterio de interlineado compacto
    if (datos.bank) {
      breakPageIfNeeded();
      finalY += sectionGap;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      setJsPdfUnicodeFont(doc, "bold");
      doc.text("Datos Bancarios:", 12, finalY);
      setJsPdfUnicodeFont(doc, "normal");
      finalY += clauseLineHeight + 2;

      Object.entries(dataBank as BankData).forEach(([key, value]) => {
        if (key === "0") return;
        breakPageIfNeeded();
        doc.text(`-${key}:  ${value}`, 15, finalY);
        finalY += clauseLineHeight;
      });
    }

    // Despedida con salto de línea automático
    breakPageIfNeeded();
    finalY += sectionGap;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    setJsPdfUnicodeFont(doc, "normal");
    const despedidaLines = doc.splitTextToSize(datos.despedida, pageWidth - 30);
    doc.text(despedidaLines, 15, finalY);
    finalY += despedidaLines.length * clauseLineHeight + 2;

    // Firma (poco espacio respecto a la despedida)
    if (finalY + 28 > 270) {
      doc.addPage();
      finalY = 20;
    }
    doc.setFontSize(11);
    doc.setTextColor(96, 96, 96); // Gris oscuro
    doc.text("Atentamente", 12, finalY + 2);

    // Agregar imagen de la firma
    if (firmaImg) {
      doc.addImage(firmaImg, "PNG", 10, finalY + 2, 15, 14);
    }

    doc.text(datos.firma, 12, finalY + 22);
    doc.setFontSize(11);
    doc.text(datos.cargo, 12, finalY + 27);

    // Previsualizar el PDF
    if (btnFunc === "preview") {
      const prev = doc.output("datauristring");
      setPdfDataUrl(prev);
    } else {
      const fechaFormateada = formatearFechaParaArchivo(datos.fecha);
      const primerasTresPalabras = obtenerPrimerasTresPalabrasConcepto();
      const nombreArchivo = `${datos.destinatarioEmpresa} ${fechaFormateada} ${primerasTresPalabras}.pdf`;

      doc.save(nombreArchivo);
    }
  };

  return (
    <>
      <section className="my-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
        <h2 className="my-4 text-center text-xl font-semibold text-gray-300">
          Cargar firma digital
        </h2>
        <div>
          <Label
            htmlFor="firmaImg"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            Firma
          </Label>
          <FileInput
            id="firmaImg"
            name="firmaImg"
            onChange={handleFirmaChange}
            accept="image/*"
            color="dark"
            helperText="Si tienes la firma en imagen PNG, aquí la puedes cargar."
            className="text-white focus:ring-cyan-500"
          />
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-4 px-3">
        <Button
          color="cyan"
          size="xl"
          onClick={() => void generarPDF()}
          type="button"
        >
          Generar PDF
        </Button>

        <Button
          color="gray"
          size="xl"
          outline
          onClick={() => void generarPDF("preview")}
          type="button"
        >
          Previsualizar PDF
        </Button>
      </section>
    </>
  );
}
