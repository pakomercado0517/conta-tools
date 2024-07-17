import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function useCreatePDF() {
  const doc = new jsPDF();

  const createDocument = (data, boolean) => {
    let header = [];
    let tableResults = [];
    Object.keys(data).map((el) => {
      return header.push(el.toUpperCase()) && tableResults.push(data[el]);
    });
    autoTable(doc, {
      head: [header],
      body: [tableResults],
    });

    //Obtener la altura de la tabla
    const tableHeight = doc.previousAutoTable.finalY;

    //Calculamos las coordenadas "x" y "y" para acomodar el total
    const totalX = 150;
    const totalY = Math.ceil(tableHeight) + 20;

    if (boolean === true) {
      //Insertamos el total en la tabla
      doc.cell(totalX, totalY, 120, 20, `${data.total}: ${data.total}`);
    }

    //Guardamos el documento
    doc.save("resultado.pdf");
  };
  return createDocument;
}
