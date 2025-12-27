"use client";

import { useState, ChangeEvent } from "react";
import CreatePDF from "./CreatePDF";
import { Label, Button, TextInput, Table, FileInput } from "flowbite-react";
import useFormatNumber from "@/hooks/useFormatNumber";

// Tipo para el elemento extraído del PDF
interface CostoItem {
  rfc: string;
  monto: number;
}

export default function GetCostForm() {
  const [extractedData, setExtractedData] = useState<CostoItem[]>([]);
  const [totalMonto, setTotalMonto] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const formatNumber = useFormatNumber();
  const styleInput = `border border-slate-600 rounded-md my-2`;

  const handleChange = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const formData = new FormData();
        formData.append("pdf", file);

        const response = await fetch("/api/extract-pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Error al procesar el PDF");
        }

        const result = await response.json();
        setExtractedData(result.data);
        // calculamos el total de todos los montos obtenidos.
        const total = result.data.reduce(
          (sum: number, entry: CostoItem) => sum + entry.monto,
          0
        );
        setTotalMonto(total);
      } catch (error) {
        console.error("Error:", error);
        alert("Error al procesar el PDF. Por favor, intenta de nuevo.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="mt-8 bg-fixed bg-no-repeat">
      <form className="mx-auto max-w-xl">
        <FileInput
          accept="application/pdf"
          onChange={handleChange}
          disabled={isProcessing}
        />
        {isProcessing && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Procesando PDF...
          </p>
        )}
      </form>

      {/* Here showing the table with the data... */}
      {/* component */}

      {extractedData.length > 0 && (
        <>
          <section className="mx-auto mt-10 max-w-xl">
            <h3 className="text-center text-xl font-semibold">
              Lista de Gastos comprados
            </h3>
            <Table>
              <Table.Head>
                <Table.HeadCell>RFC</Table.HeadCell>
                <Table.HeadCell>Monto sin IVA</Table.HeadCell>
                <Table.HeadCell>Monto Total $</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {extractedData.map((el) => (
                  <Table.Row key={el.rfc}>
                    <Table.Cell>{el.rfc}</Table.Cell>
                    <Table.Cell>{` ${formatNumber.format(el.monto / 1.16)}`}</Table.Cell>
                    <Table.Cell>{` ${formatNumber.format(el.monto)}`}</Table.Cell>
                  </Table.Row>
                ))}
                <Table.Row>
                  <Table.Cell>
                    <span className="sr-only">NO INFO</span>
                  </Table.Cell>
                  <Table.Cell className="text-center text-lg font-semibold">
                    Total:
                  </Table.Cell>
                  <Table.Cell className="text-lg font-semibold">{`${formatNumber.format(totalMonto)}`}</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </section>
          <div className="flex justify-center">
            <CreatePDF costo={extractedData} totalMonto={totalMonto} />
          </div>
        </>
      )}
    </div>
  );
}
