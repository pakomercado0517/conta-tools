import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaRegFilePdf } from "react-icons/fa6";
import { Button } from "flowbite-react";
import useFormatNumber from "@/hooks/useFormatNumber";

// Tipo para el elemento de costo individual
interface CostoItem {
  rfc: string;
  monto: number;
}

// Props del componente CreatePDF
interface CreatePDFProps {
  costo: CostoItem[];
}

export default function CreatePDF({ costo }: CreatePDFProps) {
  const doc = new jsPDF();
  const formatNumber = useFormatNumber();

  const createDoc = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    console.log("Creando documento...");

    // Calcular el monto total
    const totalMonto = costo.reduce((acc, el) => acc + el.monto, 0);

    // Crear el cuerpo de la tabla
    const body = costo.map((el) => {
      return [
        el.rfc,
        formatNumber.format(el.monto / 1.16),
        formatNumber.format(el.monto),
      ];
    });

    // Agregar la fila de totales
    body.push(["", "Total:", formatNumber.format(totalMonto)]);

    autoTable(doc, {
      head: [["RFC", "Subtotal", "Total"]],
      body: body,
    });

    doc.save("resultado.pdf");
  };

  return (
    <div className="my-8">
      <Button color="dark" onClick={createDoc}>
        <FaRegFilePdf className="mr-3 text-xl" />
        Exportar a PDF
      </Button>
    </div>
  );
}
