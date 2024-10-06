"use client";
import { Table, Select, Button } from "flowbite-react";
import { useState, useEffect } from "react";
import useFormatNumber from "../hooks/useFormatNumber";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function PaybackTable({
  data,
  discount,
  isChecked,
  isEdit,
  setCell,
}) {
  const [totalSum, setTotalSum] = useState();
  const formatNumber = useFormatNumber();

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
    <section className="mb-8 animate-fade-up">
      <Table>
        <Table.Head>
          <Table.HeadCell>Empresa</Table.HeadCell>
          <Table.HeadCell>Monto</Table.HeadCell>
          <Table.HeadCell>Comisión</Table.HeadCell>
          <Table.HeadCell>Total</Table.HeadCell>
          <Table.HeadCell>
            <span className="sr-only">Editar</span>
          </Table.HeadCell>
          {isChecked && <Table.HeadCell>Concepto Descuento</Table.HeadCell>}
        </Table.Head>
        <Table.Body className="divide-y">
          {data.length > 0 &&
            data.map((el, index) => (
              <Table.Row key={index} className="border-gray-600">
                <Table.Cell>{el?.empresa}</Table.Cell>
                <Table.Cell>{formatNumber.format(el?.monto)}</Table.Cell>
                <Table.Cell>
                  {" "}
                  {`-${formatNumber.format(el?.comision)}`}{" "}
                </Table.Cell>
                <Table.Cell>{formatNumber.format(el?.total)}</Table.Cell>
                <Table.Cell className="flex gap-5">
                  {" "}
                  <Button
                    size="sm"
                    color="failure"
                    onClick={() => deleteCell(index)}
                  >
                    <RiDeleteBin6Line />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          {isChecked && (
            <>
              {discount.map((d, index) => (
                <Table.Row className="border-gray-600" key={index}>
                  <Table.Cell></Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell className="text-red-500">{d.date}</Table.Cell>
                  <Table.Cell className="text-red-500">{`-${formatNumber.format(d.total)}`}</Table.Cell>
                  <Table.Cell className="text-red-500">{d.concept}</Table.Cell>
                </Table.Row>
              ))}
              <Table.Row className="border-gray-600">
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell className="font-bold underline">
                  Suma Total
                </Table.Cell>
                <Table.Cell>{formatNumber.format(totalSum)}</Table.Cell>
              </Table.Row>
            </>
          )}
          <Table.Row className="border-gray-600">
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
          </Table.Row>
          {!isChecked && (
            <Table.Row className="border-gray-600">
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell className="font-bold underline">
                Suma Total
              </Table.Cell>
              <Table.Cell>{formatNumber.format(totalSum)}</Table.Cell>
            </Table.Row>
          )}
          {/* {isChecked && (
            <>
              <Table.Row>
                <Table.Cell className="bg-gray-50 font-semibold dark:bg-gray-700"></Table.Cell>
                <Table.Cell className="bg-gray-50 font-semibold dark:bg-gray-700"></Table.Cell>
                <Table.Cell className="bg-gray-50 font-semibold dark:bg-gray-700">
                  Fecha
                </Table.Cell>
                <Table.Cell className="bg-gray-50 font-semibold dark:bg-gray-700">
                  Monto
                </Table.Cell>
                <Table.Cell className="bg-gray-50 font-semibold dark:bg-gray-700">
                  <span className="sr-only">Concepto</span>
                </Table.Cell>
              </Table.Row>
              {discount.map((d, index) => (
                <Table.Row className="border-gray-600" key={index}>
                  <Table.Cell></Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell className="text-red-500">{d.date}</Table.Cell>
                  <Table.Cell className="text-red-500">{`-${formatNumber.format(d.total)}`}</Table.Cell>
                  <Table.Cell className="text-red-500">{d.concept}</Table.Cell>
                </Table.Row>
              ))}
              <Table.Row className="border-gray-600">
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell className="font-bold underline">
                  Suma Total
                </Table.Cell>
                <Table.Cell>{formatNumber.format(totalSum)}</Table.Cell>
              </Table.Row>
            </>
          )} */}
        </Table.Body>
      </Table>
    </section>
  );
}
