import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaRegFilePdf } from "react-icons/fa6";
import { Button } from "flowbite-react";
import useFormatNumber from "@/hooks/useFormatNumber";

export default function CreatePDF({ costo, totalMonto }) {
  const [totalResult, setTotalResult] = useState();
  const doc = new jsPDF();
  const formatNumber = useFormatNumber();

  useEffect(() => {
    const getResults = async () => {
      const arr = [];
      await costo.map((el) => arr.push(parseInt(el.monto)));
      let result = arr.reduce((a, b) => a + b, 0);
      result = result.toString().split(".");
      result[0] = result[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      setTotalResult(result);
    };
    getResults();
  }, [costo]);

  const formatTotal = (num) => {
    let result;
    result = num.toString().split(".");
    result[0] = result[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return result.join(".");
  };
  const formatSubtotal = (num) => {
    let result;
    result = num.toFixed(2);
    result = result.toString().split(".");
    result[0] = result[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return result.join(".");
  };

  const createDoc = (e) => {
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
