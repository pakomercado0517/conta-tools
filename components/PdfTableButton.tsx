import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CellInput } from "jspdf-autotable";
import { Button } from "flowbite-react";

// Tipo para el elemento de datos
interface DataItem {
  empresa: string;
  monto: number;
  percentage: string;
  comision: number;
  total: number;
}

// Tipo para el elemento de descuento
interface DiscountItem {
  total: number;
  date: string;
  concept: string;
}

// Props del componente PDFButton
interface PDFButtonProps {
  data: DataItem[];
  discount: DiscountItem[];
  isChecked: boolean;
}

export default function PDFButton({
  data,
  discount,
  isChecked,
}: PDFButtonProps) {
  const formatNumber = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  });
  const date = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const handleDownload = (): void => {
    const doc = new jsPDF();

    const head = [
      "Empresa",
      "Monto",
      `Comisión ${data[0].percentage}%`,
      "Total",
      ...(isChecked ? ["Fecha", "Concepto"] : []),
    ];

    const body: CellInput[][] = data.map((el) => [
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
