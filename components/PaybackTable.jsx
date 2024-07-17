"use client";
import { Table } from "flowbite-react";
import { useState, useEffect } from "react";
import useFormatNumber from "../hooks/useFormatNumber";

export default function PaybackTable({ data }) {
  const [totalSum, setTotalSum] = useState();
  const formatNumber = useFormatNumber();

  useEffect(() => {
    const totales = data.reduce((sum, item) => {
      const totalNumber = parseFloat(
        item.total.replace("$", "").replace(",", ""),
      );
      return sum + totalNumber;
    }, 0);
    setTotalSum(formatNumber.format(totales));
  }, [data, formatNumber]);

  return (
    <section className="animate-fade-up">
      <Table>
        <Table.Head>
          <Table.HeadCell>Empresa</Table.HeadCell>
          <Table.HeadCell>Monto</Table.HeadCell>
          <Table.HeadCell>Comisión</Table.HeadCell>
          <Table.HeadCell>Total</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {data.length > 0 &&
            data.map((el, index) => (
              <Table.Row key={index} className="border-gray-600">
                <Table.Cell>{el?.empresa}</Table.Cell>
                <Table.Cell>{el?.monto}</Table.Cell>
                <Table.Cell> {el?.comision} </Table.Cell>
                <Table.Cell>{el?.total}</Table.Cell>
              </Table.Row>
            ))}
          <Table.Row className="border-gray-600">
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
          </Table.Row>
          <Table.Row className="border-gray-600">
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell className="font-bold underline">Suma Total</Table.Cell>
            <Table.Cell>{totalSum}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </section>
  );
}
