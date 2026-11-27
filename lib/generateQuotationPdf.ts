import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatConceptText } from "@/lib/formatConceptText";
import {
  ensureJsPdfUnicodeFont,
  JSPDF_UNICODE_FONT,
  setJsPdfUnicodeFont,
} from "@/lib/jspdfUnicodeFont";
import {
  computeQuotationSummary,
  lineAmount,
  parsePrecioUnitario,
  quotationSummaryLabels,
  textoCantidadConLetra,
} from "@/lib/quotationTotals";
import type {
  BankData,
  QuotationFormData,
  QuotationProduct,
} from "@/types/quotation";

const formatNumber = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

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

function formatearFecha(fecha: string, lugar: string): string {
  const date = new Date(fecha);
  const dia = date.getUTCDate();
  const mes = meses[date.getUTCMonth()];
  const año = date.getUTCFullYear();
  return `${lugar}. A ${dia} de ${mes} del ${año}.`;
}

function formatearFechaParaArchivo(fecha: string): string {
  const date = new Date(fecha);
  const dia = date.getUTCDate().toString().padStart(2, "0");
  const mes = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const año = date.getUTCFullYear();
  return `${dia}-${mes}-${año}`;
}

function obtenerPrimerasTresPalabrasConcepto(datos: QuotationFormData): string {
  if (
    datos.productos &&
    datos.productos.length > 0 &&
    datos.productos[0].descripcion
  ) {
    return datos.productos[0].descripcion.trim().split(/\s+/).slice(0, 3).join(" ");
  }
  return "Cotización";
}

function formatPrecioCell(v: string | number): string {
  const p = parsePrecioUnitario(v);
  if (p === null) return "";
  return formatNumber.format(p);
}

function formatTotalCell(producto: QuotationProduct): string {
  const amount = lineAmount(producto);
  if (amount === null) return "";
  return formatNumber.format(amount);
}

export function quotationPdfFileName(datos: QuotationFormData): string {
  const fechaFormateada = formatearFechaParaArchivo(datos.fecha);
  const primerasTresPalabras = obtenerPrimerasTresPalabrasConcepto(datos);
  return `${datos.destinatarioEmpresa} ${fechaFormateada} ${primerasTresPalabras}.pdf`;
}

export async function generateQuotationPdf(options: {
  datos: QuotationFormData;
  dataBank: BankData | BankData[];
  firmaImg: string | null;
}): Promise<jsPDF> {
  const { datos, dataBank, firmaImg } = options;
  const doc = new jsPDF();
  await ensureJsPdfUnicodeFont(doc);
  setJsPdfUnicodeFont(doc, "normal");

  const pageWidth = doc.internal.pageSize.getWidth();

  const contacto = `Tel: ${datos.telefono} | Email: ${datos.email}`;
  const logoWidth = 30;
  const logoHeight = 30;

  if (datos.logoEmpresa) {
    doc.addImage(datos.logoEmpresa, "PNG", 10, 2, logoWidth, logoHeight);
  }

  doc.setFontSize(16);
  doc.setTextColor(96, 96, 96);
  doc.text(datos.empresa, pageWidth / 2, 10, { align: "center" });
  doc.setFontSize(10);
  doc.text(String(datos.rfc).toUpperCase(), pageWidth / 2, 15, {
    align: "center",
  });
  doc.text(datos.domicilio, pageWidth / 2, 20, { align: "center" });
  doc.text(contacto, pageWidth / 2, 25, { align: "center" });

  const encabezadoUltimaY = 25;
  const espacioEncabezadoFechaMm = 12;
  const fechaY = encabezadoUltimaY + espacioEncabezadoFechaMm;
  const fechaFormateada = formatearFecha(datos.fecha, datos.lugar);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(fechaFormateada, pageWidth - 20, fechaY, { align: "right" });

  const espacioFechaDestinatarioMm = 14;

  doc.setFontSize(11);
  const destinatarioEmpresaY = fechaY + espacioFechaDestinatarioMm;
  doc.text(`${datos.destinatarioEmpresa}.`, 12, destinatarioEmpresaY);
  doc.text(`${datos.destinatario}.`, 12, destinatarioEmpresaY + 6);

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

  const summary = computeQuotationSummary(datos.productos);
  const labels = quotationSummaryLabels(datos);
  const textoCantidadCompleto = textoCantidadConLetra(
    summary.totalFinal,
    labels.prefijoCantidadLetra
  );

  const taxFooterRows = summary.taxRows.map((row) => [
    {
      content: row.etiquetaPdf,
      colSpan: 4,
      styles: { fontStyle: "bold", halign: "right" as const },
    },
    formatNumber.format(row.monto),
  ]);

  doc.autoTable({
    startY: tableStartY,
    head: [["Cantidad", "Unidad", "Descripción", "Precio Unitario", "Total"]],
    body: [
      ...datos.productos.map((producto) => [
        String(producto.cantidad),
        formatConceptText(producto.unidad),
        formatConceptText(producto.descripcion),
        formatPrecioCell(producto.precioUnitario),
        formatTotalCell(producto),
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
          content: labels.etiquetaSubtotal,
          colSpan: 4,
          styles: { fontStyle: "bold", halign: "right" },
        },
        formatNumber.format(summary.subtotal),
      ],
      ...taxFooterRows,
      [
        {
          content: labels.etiquetaTotal,
          colSpan: 4,
          styles: { fontStyle: "bold", halign: "right" },
        },
        formatNumber.format(summary.totalFinal),
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

  const finalYBase = doc.previousAutoTable?.finalY;
  if (finalYBase === undefined) {
    throw new Error("No se pudo obtener la posición tras autoTable");
  }
  let finalY = finalYBase + 10;

  const clauseLineHeight = 6;
  const sectionGap = 5;
  const breakPageIfNeeded = (): void => {
    if (finalY > 270) {
      doc.addPage();
      finalY = 20;
    }
  };

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

  breakPageIfNeeded();
  finalY += sectionGap;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  setJsPdfUnicodeFont(doc, "normal");
  const despedidaLines = doc.splitTextToSize(datos.despedida, pageWidth - 30);
  doc.text(despedidaLines, 15, finalY);
  finalY += despedidaLines.length * clauseLineHeight + 2;

  if (finalY + 28 > 270) {
    doc.addPage();
    finalY = 20;
  }
  doc.setFontSize(11);
  doc.setTextColor(96, 96, 96);
  doc.text("Atentamente", 12, finalY + 2);

  if (firmaImg) {
    doc.addImage(firmaImg, "PNG", 10, finalY + 2, 15, 14);
  }

  doc.text(datos.firma, 12, finalY + 22);
  doc.setFontSize(11);
  doc.text(datos.cargo, 12, finalY + 27);

  return doc;
}
