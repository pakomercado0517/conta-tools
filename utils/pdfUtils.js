import * as pdfjsLib from "pdfjs-dist/build/pdf";
import * as pdfWorker from "pdfjs-dist/build/pdf.worker";

pdfjsLib.GlobalWorkerOptions.WorkerSrc = pdfWorker;

export const extractDataFromPDF = async (pdfData) => {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const numPages = pdf.numPages;
    const extractedData = [];

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

    return extractedData;
  } catch (error) {
    console.log(error);
  }
};

const findMontos = (text) => {
  // Utilizamos la expresión regular con el modificador g para buscar todas las coincidencias
  const montoRegex = /Total:\s*\$?([\d,]+\.\d{2})/g;
  //Con matchAll devolvemos todas las coincidencias encontradas
  const matches = [...text.matchAll(montoRegex)];
  //map lo utilizamos para borrar las comas y devolver valores numericos.
  return matches.map((match) => match[1].replace(/,/g, ""));
};

const findRFCs = (text) => {
  // Utilizamos la expresión regular con el modificador g para buscar todas las coincidencias

  const rfcRegex = /RFC Emisor:\s*([A-Z0-9]{12,13})/g;
  //Con matchAll devolvemos todas las coincidencias encontradas

  const matches = [...text.matchAll(rfcRegex)];
  return matches.map((match) => match[1]);
};
