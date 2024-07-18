"use client";

import { useState } from "react";
import CreatePDF from "./CreatePDF";
import { Label, Button, TextInput, Table, FileInput } from "flowbite-react";
import { extractDataFromPDF } from "@/utils/pdfUtils";
import useFormatNumber from "@/hooks/useFormatNumber";

export default function GetCostForm() {
  const [extractedData, setExtractedData] = useState([]);
  const [totalMonto, setTotalMonto] = useState(0);
  const formatNumber = useFormatNumber();
  const styleInput = `border border-slate-600 rounded-md my-2`;

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const pdfData = event.target.result;
        const data = await extractDataFromPDF(new Uint8Array(pdfData));
        setExtractedData(data);
        //calculamos el total de todos los montos obtenidos.
        const total = data.reduce((sum, entry) => sum + entry.monto, 0);
        setTotalMonto(total);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="mx-auto mt-8">
      <form className="mx-auto max-w-xl">
        <FileInput accept="application/pdf" onChange={handleChange} />
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
            <CreatePDF costo={extractedData} />
          </div>
        </>
      )}
    </div>
  );
}
