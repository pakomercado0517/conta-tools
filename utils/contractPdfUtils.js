import * as pdfjsLib from "pdfjs-dist/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

/**
 * Extrae datos específicos de facturas para generar contratos
 * @param {ArrayBuffer} pdfData - Datos del PDF
 * @returns {Promise<Object>} Datos extraídos de la factura
 */
export async function extractInvoiceDataForContract(pdfData) {
  console.log(
    "extractInvoiceDataForContract called with data size:",
    pdfData.byteLength
  );
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    console.log("PDF loaded, pages:", pdf.numPages);
    const numPages = pdf.numPages;
    let allText = "";

    // Extraer todo el texto del PDF
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      allText += pageText + " ";
      console.log(`Page ${i} text length:`, pageText.length);
    }

    console.log("Total text length:", allText.length);
    console.log("First 500 chars:", allText.substring(0, 500));

    // Extraer datos específicos
    const invoiceData = {
      emisor: extractEmisor(allText),
      receptor: extractReceptor(allText),
      monto: extractMonto(allText),
      formaPago: extractFormaPago(allText),
      fecha: extractFechaFactura(allText),
      folio: extractFolio(allText),
      rfc_emisor: extractRFCEmisor(allText),
      rfc_receptor: extractRFCReceptor(allText),
      conceptos: extractConceptos(allText),
      subtotal: extractSubtotal(allText),
      iva: extractIVA(allText),
      moneda: extractMoneda(allText),
    };

    console.log("Invoice data extracted:", invoiceData);
    return invoiceData;
  } catch (error) {
    console.error("Error extracting invoice data:", error);
    return null;
  }
}

/**
 * Extrae múltiples facturas para generar un contrato con fechas de pago
 * @param {File[]} pdfFiles - Array de archivos PDF
 * @returns {Promise<Object[]>} Array de datos de facturas
 */
export async function extractMultipleInvoicesData(pdfFiles) {
  const invoicesData = [];

  for (const file of pdfFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const invoiceData = await extractInvoiceDataForContract(arrayBuffer);
    if (invoiceData) {
      invoicesData.push({
        ...invoiceData,
        fileName: file.name,
      });
    }
  }

  return invoicesData;
}

// Funciones auxiliares para extraer datos específicos

function extractEmisor(text) {
  // Buscar nombre del emisor basado en el formato de facturas mexicanas
  const patterns = [
    // Patrón específico para facturas mexicanas: RFC - NOMBRE COMPLETO
    /([A-Z]{3,4}\d{6}[A-Z0-9]{3})\s*-\s*([A-ZÁÉÍÓÚÑ\s.,&]+?)(?:\n|Régimen)/i,
    // Patrón para "Emisor" seguido del nombre
    /Emisor\s*([A-ZÁÉÍÓÚÑ\s.,&]+?)(?:\n|RFC|Régimen)/i,
    // Patrón genérico RFC - Nombre
    /[A-Z]{3,4}\d{6}[A-Z0-9]{3}\s*-\s*([A-ZÁÉÍÓÚÑ\s.,&]+?)(?:\s+Régimen|\n|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Si el patrón tiene 2 grupos, el nombre está en el segundo grupo
      let name = match[2] ? match[2].trim() : match[1].trim();

      // Limpiar el nombre
      name = name.replace(/\b(Régimen\s*fiscal|RFC|Emisor)\b/gi, "").trim();
      name = name.replace(/\s+/g, " ").trim();

      if (name.length > 3 && !name.match(/^\d+$/)) {
        return name;
      }
    }
  }
  return "";
}

function extractReceptor(text) {
  // Buscar nombre del receptor basado en el formato de facturas mexicanas
  const patterns = [
    // Patrón específico: RFC - NOMBRE COMPLETO (como JUHA810201I35 - Alexander Juárez Hernández)
    /Receptor[\s\S]*?([A-Z]{3,4}\d{6}[A-Z0-9]{3})\s*-\s*([A-ZÁÉÍÓÚÑ\s.,&]+?)(?:\n|Uso\s+del)/i,
    // Patrón general
    /Receptor[\s\S]*?([A-ZÁÉÍÓÚÑ\s.,&]+?)(?:\n|Uso\s+del|Información)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Si hay dos grupos, el nombre está en el segundo grupo
      let name = match[2] ? match[2].trim() : match[1].trim();

      // Limpiar el nombre
      name = name
        .replace(/\b(Uso\s+del\s+CFDI|Información|Receptor)\b/gi, "")
        .trim();
      name = name.replace(/\s+/g, " ").trim();

      if (name.length > 3 && !name.match(/^[A-Z0-9]{12,13}$/)) {
        return name;
      }
    }
  }
  return "";
}

function extractMonto(text) {
  // Buscar el monto total basado en el formato real de facturas
  const patterns = [
    // Patrón específico para "Total $71,340.00"
    /Total\s+\$([\d,]+\.\d{2})/i,
    // Patrones alternativos
    /Total:\s*\$?\s*([\d,]+\.?\d*)/i,
    /Importe Total:\s*\$?\s*([\d,]+\.?\d*)/i,
    /Monto Total:\s*\$?\s*([\d,]+\.?\d*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ""));
    }
  }
  return 0;
}

function extractFormaPago(text) {
  // Buscar forma de pago basado en formato real (ej: "Forma de pago 03 Transferencia electrónica de fondos")
  const patterns = [
    // Patrón específico: "Forma de pago 03 Transferencia electrónica de fondos"
    /Forma\s+de\s+pago\s+(\d{2})\s+([A-ZÁÉÍÓÚÑ\sóéíñú]+?)(?:\n|Método)/i,
    // Patrones alternativos
    /Forma de Pago:\s*(\d{2})\s*-?\s*([A-ZÁÉÍÓÚÑ\s]+)/i,
    /Método de Pago:\s*([A-ZÁÉÍÓÚÑ\s]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[2] ? match[2].trim() : match[1].trim();
    }
  }

  // Formas de pago comunes por código
  if (text.includes("01")) return "Efectivo";
  if (text.includes("02")) return "Cheque nominativo";
  if (text.includes("03")) return "Transferencia electrónica de fondos";
  if (text.includes("04")) return "Tarjeta de crédito";
  if (text.includes("28")) return "Tarjeta de débito";

  return "No especificada";
}

function extractFechaFactura(text) {
  // Buscar fecha de la factura (formato: 2021-08-04T18:16:20 o similar)
  const patterns = [
    // Fecha ISO format
    /Fecha de emisión\s+(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}/i,
    /Fecha de certificación\s+(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}/i,
    // Formatos tradicionales
    /Fecha:\s*(\d{1,2}\/\d{1,2}\/\d{4})/,
    /Fecha de Emisión:\s*(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(\d{4}-\d{2}-\d{2})/,
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let fecha = match[1];
      // Convertir formato ISO a formato local
      if (fecha.includes("-") && fecha.length === 10) {
        const [year, month, day] = fecha.split("-");
        fecha = `${day}/${month}/${year}`;
      }
      return fecha;
    }
  }
  return new Date().toLocaleDateString();
}

function extractFolio(text) {
  // Buscar número de folio (ej: "Folio fiscal B196ED1A-3EC9-4439-9575-01A5E0E50993")
  const patterns = [
    // Folio fiscal UUID
    /Folio\s+fiscal\s+([A-Z0-9\-]+)/i,
    // Patrones tradicionales
    /Folio:\s*([A-Z0-9\-]+)/i,
    /Serie y Folio:\s*([A-Z0-9\-]+)/i,
    /No\.\s*Factura:\s*([A-Z0-9\-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return "";
}

function extractRFCEmisor(text) {
  const patterns = [
    // RFC al inicio del nombre (ej: VAVS7906296Z0 - SIRLEY ROSALBA...)
    /Emisor[\s\S]*?([A-Z]{3,4}\d{6}[A-Z0-9]{3})\s*-/i,
    // Patrones tradicionales
    /RFC Emisor:\s*([A-Z0-9]{12,13})/i,
    /RFC:\s*([A-Z0-9]{12,13})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return "";
}

function extractRFCReceptor(text) {
  const patterns = [
    // RFC al inicio del receptor (ej: JUHA810201I35 - Alexander Juárez...)
    /Receptor[\s\S]*?([A-Z]{3,4}\d{6}[A-Z0-9]{3})\s*-/i,
    // Patrones tradicionales
    /RFC Receptor:\s*([A-Z0-9]{12,13})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return "";
}

function extractConceptos(text) {
  // Buscar conceptos/servicios en la factura (ej: "Tubería de acero inoxidable.")
  const patterns = [
    // Buscar en la sección de descripción de la tabla
    /Descripción[\s\S]*?([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\sóéíñú.,\-]+?)(?:\s+Impuesto|Precio)/i,
    // Buscar productos/servicios comunes
    /(?:Clave|\d+)\s+\d+\s+[A-Z0-9]+\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\sóéíñú.,\-]+?)\s+(?:Impuesto|\$)/i,
    // Patrones tradicionales
    /(?:Concepto|Descripción|Servicio):\s*([^\n\r]{10,100})/i,
    /\b(tubería|consultoría|desarrollo|diseño|mantenimiento|servicios?\s+[\w\sñéíóú]+)\b/gi,
  ];

  const conceptos = [];

  for (const pattern of patterns) {
    const matches = [
      ...text.matchAll(new RegExp(pattern.source, pattern.flags + "g")),
    ];
    for (const match of matches) {
      const concepto = match[1]?.trim();
      if (concepto && concepto.length > 5 && concepto.length < 200) {
        // Limpiar el concepto
        let cleanConcepto = concepto
          .replace(
            /\b(Impuesto\s+trasladado|Precio\s+Unitario|Base\s+para).*$/gi,
            ""
          )
          .trim();
        cleanConcepto = cleanConcepto.replace(/\.$/, ""); // Quitar punto final
        if (cleanConcepto.length > 3) {
          conceptos.push(cleanConcepto);
        }
      }
    }
  }

  // Si no encuentra conceptos específicos, buscar servicios comunes
  if (conceptos.length === 0) {
    const serviciosComunes = [
      "servicios profesionales",
      "consultoría",
      "desarrollo de software",
      "diseño web",
      "mantenimiento de sistemas",
      "asesoría técnica",
      "suministros industriales",
    ];

    for (const servicio of serviciosComunes) {
      if (text.toLowerCase().includes(servicio.toLowerCase())) {
        conceptos.push(servicio);
        break;
      }
    }
  }

  return conceptos.length > 0
    ? conceptos.slice(0, 3).join(", ")
    : "Servicios profesionales";
}

function extractSubtotal(text) {
  const patterns = [
    /Subtotal:\s*\$?\s*([\d,]+\.?\d*)/i,
    /Sub Total:\s*\$?\s*([\d,]+\.?\d*)/i,
    /Importe:\s*\$?\s*([\d,]+\.?\d*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ""));
    }
  }
  return 0;
}

function extractIVA(text) {
  const patterns = [
    /IVA\s*(?:16%|\(16%\))?:\s*\$?\s*([\d,]+\.?\d*)/i,
    /Impuesto:\s*\$?\s*([\d,]+\.?\d*)/i,
    /I\.V\.A\.?:\s*\$?\s*([\d,]+\.?\d*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ""));
    }
  }
  return 0;
}

function extractMoneda(text) {
  // Buscar tipo de moneda
  if (text.includes("USD") || text.includes("Dólares")) {
    return "USD";
  }
  if (text.includes("EUR") || text.includes("Euros")) {
    return "EUR";
  }
  return "MXN"; // Por defecto pesos mexicanos
}

/**
 * Combina datos de múltiples facturas para generar información del contrato
 * @param {Object[]} invoicesData - Array de datos de facturas
 * @returns {Object} Datos combinados para el contrato
 */
export function combineInvoicesDataForContract(invoicesData) {
  if (!invoicesData || invoicesData.length === 0) {
    return {};
  }

  const firstInvoice = invoicesData[0];
  const totalAmount = invoicesData.reduce(
    (sum, invoice) => sum + (invoice.monto || 0),
    0
  );

  // Combinar todos los conceptos
  const allConceptos = invoicesData
    .map((invoice) => invoice.conceptos)
    .filter((concepto) => concepto && concepto !== "Servicios profesionales")
    .join(", ");

  return {
    prestador: firstInvoice.emisor || "",
    cliente: firstInvoice.receptor || "",
    montoTotal:
      totalAmount > 0
        ? `$${totalAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
        : "",
    formaPago: firstInvoice.formaPago || "Transferencia electrónica de fondos",
    servicios:
      allConceptos ||
      "Servicios profesionales de acuerdo a las facturas anexas",
    moneda: firstInvoice.moneda || "MXN",
  };
}
