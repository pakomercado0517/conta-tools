import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "flowbite-react";

export default function PDFButton({ data, discount, isChecked }) {
  const formatNumber = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  });
  const date = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const handleDownload = () => {
    const doc = new jsPDF();

    const head = [
      "Empresa",
      "Monto",
      "Comisión",
      "Total",
      ...(isChecked ? ["Fecha", "Concepto"] : []),
    ];

    const body = data.map((el) => [
      el.empresa,
      formatNumber.format(el.monto),
      `-${formatNumber.format(el.comision)}`,
      formatNumber.format(el.total),
      ...(isChecked ? ["", ""] : []),
    ]);

    if (isChecked && discount.length > 0) {
      discount.forEach((d) => {
        body.push([
          "",
          "",
          "",
          {
            content: `-${formatNumber.format(d.total)}`,
            styles: { textColor: [255, 0, 0] },
          },
          { content: d.date, styles: { textColor: [255, 0, 0] } },
          { content: d.concept, styles: { textColor: [255, 0, 0] } },
        ]);
      });
    }

    const totalSum =
      data.reduce((sum, el) => sum + el.total, 0) -
      (isChecked ? discount.reduce((sum, d) => sum + d.total, 0) : 0);

    const totalRow = [
      "",
      "",
      "Suma Total:",
      formatNumber.format(totalSum),
      ...(isChecked ? ["", ""] : []),
    ];

    body.push(totalRow);

    autoTable(doc, {
      head: [head],
      body: body,
    });

    doc.save(`${data[0].empresa}-${date}.pdf`);
  };

  return (
    <Button color="light" onClick={handleDownload} className="mt-4">
      Descargar PDF
    </Button>
  );
}
