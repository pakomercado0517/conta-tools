import { NextRequest, NextResponse } from "next/server";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

// Configurar el worker para pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

// Funciones auxiliares para extraer datos
function findMontos(text: string): string[] {
  const montoRegex = /Total:\s*\$?([\d,]+\.\d{2})/g;
  const matches = [...text.matchAll(montoRegex)];
  return matches.map((match) => match[1].replace(/,/g, ""));
}

function findRFCs(text: string): string[] {
  const rfcRegex = /RFC Emisor:\s*([A-Z0-9]{12,13})/g;
  const matches = [...text.matchAll(rfcRegex)];
  return matches.map((match) => match[1]);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo PDF" },
        { status: 400 }
      );
    }

    // Convertir el archivo a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Procesar el PDF
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    const numPages = pdf.numPages;
    const extractedData: { rfc: string; monto: number }[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");

      const montos = findMontos(pageText);
      const rfcs = findRFCs(pageText);

      for (let j = 0; j < rfcs.length; j++) {
        const rfc = rfcs[j];
        const monto = montos[j] ? parseFloat(montos[j]) : 0;
        const existingEntry = extractedData.find((data) => data.rfc === rfc);
        if (existingEntry) {
          existingEntry.monto += monto;
        } else {
          extractedData.push({ monto, rfc });
        }
      }
    }

    return NextResponse.json({ data: extractedData });
  } catch (error) {
    console.error("Error procesando PDF:", error);
    return NextResponse.json(
      { error: "Error al procesar el PDF" },
      { status: 500 }
    );
  }
}


