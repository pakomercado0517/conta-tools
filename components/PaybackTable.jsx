"use client";
import { Table, Select, Button } from "flowbite-react";
import { useState, useEffect } from "react";
import useFormatNumber from "../hooks/useFormatNumber";
import { RiDeleteBin6Line, RiEdit2Line } from "react-icons/ri";

export default function PaybackTable({
  data,
  discount,
  isChecked,
  setCell,
  onEdit,
}) {
  const [totalSum, setTotalSum] = useState();
  const formatNumber = useFormatNumber();

  const handleEdit = (row, index) => {
    if (onEdit) {
      onEdit(row, index);
    }
  };

  useEffect(() => {
    const totales = data.reduce((sum, item) => sum + item.total, 0);
    setTotalSum(totales);

    if (isChecked) {
      const newTotal = discount.reduce(
        (sum, item) => sum + (item.total || 0),
        0,
      );
      setTotalSum(totales - newTotal);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, discount, isChecked]);

  const deleteCell = (index) =>
    setCell((prevDatos) => prevDatos.filter((_, i) => i !== index));

  return (
    <section className="mb-8 animate-fade-up rounded-xl bg-gray-900/60 p-6 shadow-md">
      <Table className="w-full text-sm text-white">
        <Table.Head>
          <Table.HeadCell className="bg-gray-800 text-gray-100">
            Empresa
          </Table.HeadCell>
          <Table.HeadCell className="bg-gray-800 text-gray-100">
            Monto
          </Table.HeadCell>
          <Table.HeadCell className="bg-gray-800 text-gray-100">
            Comisión
          </Table.HeadCell>
          <Table.HeadCell className="bg-gray-800 text-gray-100">
            Total
          </Table.HeadCell>
          <Table.HeadCell className="bg-gray-800 text-gray-100">
            {isChecked ? "Fecha" : ""}
          </Table.HeadCell>
          <Table.HeadCell className="bg-gray-800 text-gray-100">
            {isChecked ? "Concepto de descueto" : ""}
          </Table.HeadCell>
        </Table.Head>

        <Table.Body>
          {data.length > 0 &&
            data.map((el, index) => (
              <Table.Row key={index} className="bg-gray-800 text-gray-100">
                <Table.Cell className="bg-gray-800 text-gray-100">
                  {el?.empresa}
                </Table.Cell>
                <Table.Cell className="bg-gray-800 text-gray-100">
                  {formatNumber.format(el?.monto)}
                </Table.Cell>
                <Table.Cell className="bg-gray-800 text-gray-100">{`-${formatNumber.format(el?.comision)}`}</Table.Cell>
                <Table.Cell className="bg-gray-800 text-gray-100">
                  {formatNumber.format(el?.total)}
                </Table.Cell>
                {/* Botón de editar agregado */}
                <Table.Cell className="bg-gray-800 text-right text-gray-100">
                  <Button
                    size="sm"
                    color="info"
                    onClick={() => handleEdit(el, index)}
                  >
                    <RiEdit2Line className="mr-2 flex self-center" /> Editar
                  </Button>
                </Table.Cell>
                <Table.Cell className="bg-gray-800 text-right text-gray-100">
                  <Button
                    size="sm"
                    color="failure"
                    onClick={() => deleteCell(index)}
                  >
                    <RiDeleteBin6Line className="mr-2 flex self-center" />{" "}
                    Eliminar
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}

          {isChecked && (
            <>
              {discount.map((d, index) => (
                <Table.Row className="bg-gray-800" key={index}>
                  <Table.Cell className="bg-gray-800 text-gray-100"></Table.Cell>
                  <Table.Cell className="bg-gray-800 text-gray-100"></Table.Cell>
                  <Table.Cell className="bg-gray-800 text-gray-100"></Table.Cell>
                  <Table.Cell className="bg-gray-800 text-red-500">{`-${formatNumber.format(d.total)}`}</Table.Cell>
                  <Table.Cell className="bg-gray-800 text-red-500">
                    {d.date}
                  </Table.Cell>
                  <Table.Cell className="bg-gray-800 text-red-500">
                    {d.concept}
                  </Table.Cell>
                </Table.Row>
              ))}
              {/* La fila de "Suma Total" ahora es la penúltima */}
              <Table.Row className="bg-gray-800 font-bold">
                <Table.Cell className="bg-gray-800"></Table.Cell>
                <Table.Cell className="bg-gray-800"></Table.Cell>
                <Table.Cell className="bg-gray-800 underline">
                  Suma Total
                </Table.Cell>
                <Table.Cell className="bg-gray-800">
                  {formatNumber.format(totalSum)}
                </Table.Cell>
                <Table.Cell className="bg-gray-800"></Table.Cell>
                <Table.Cell className="bg-gray-800"></Table.Cell>
              </Table.Row>
            </>
          )}

          {/* Fila vacía movida a la última posición */}
          <Table.Row className="bg-gray-800 text-gray-100">
            <Table.Cell className="bg-gray-800 text-gray-100"></Table.Cell>
            <Table.Cell className="bg-gray-800 text-gray-100"></Table.Cell>
            <Table.Cell className="bg-gray-800 text-gray-100"></Table.Cell>
            <Table.Cell className="bg-gray-800 text-gray-100"></Table.Cell>
            <Table.Cell className="bg-gray-800 text-gray-100"></Table.Cell>
            <Table.Cell className="bg-gray-800 text-gray-100"></Table.Cell>
          </Table.Row>

          {!isChecked && (
            <Table.Row className="bg-gray-800 font-bold">
              <Table.Cell className="bg-gray-800"></Table.Cell>
              <Table.Cell className="bg-gray-800"></Table.Cell>
              <Table.Cell className="bg-gray-800 underline">
                Suma Total
              </Table.Cell>
              <Table.Cell className="bg-gray-800">
                {formatNumber.format(totalSum)}
              </Table.Cell>
              <Table.Cell className="read-only bg-gray-800"></Table.Cell>
              <Table.Cell className="read-only bg-gray-800"></Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </section>
  );
}
