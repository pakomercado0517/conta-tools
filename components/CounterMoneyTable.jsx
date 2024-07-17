"use client";

import { useState } from "react";
import { Table, TextInput } from "flowbite-react";
import useFormatNumber from "@/hooks/useFormatNumber";

export default function CounterMoneyTable() {
  const [counter, setCounter] = useState({
    1000: 0,
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
  });

  const formatNumber = useFormatNumber();

  const [total, setTotal] = useState({});

  const handleChange = async (e) => {
    setCounter({
      ...counter,
      [e.target.name]: e.target.value,
    });
    setTotal({
      ...total,
      [e.target.name]: parseInt(e.target.name) * e.target.value,
    });
  };

  const getResults = () => {
    let $total = Object.values(total);
    $total = $total.reduce((a, b) => a + b, 0);
    return formatNumber.format($total);
  };

  return (
    <section className="animate-fade mx-auto mt-10 max-w-4xl">
      <Table>
        <Table.Head>
          <Table.HeadCell>Billete &#40;Denominación&#41;</Table.HeadCell>
          <Table.HeadCell>Cantidad</Table.HeadCell>
          <Table.HeadCell>Total</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          <Table.Row>
            <Table.Cell>$1,000</Table.Cell>
            <Table.Cell>
              <TextInput type="number" name="1000" onChange={handleChange} />
            </Table.Cell>
            <Table.Cell>{`${total[1000] ? formatNumber.format(total[1000]) : 0}`}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>$500</Table.Cell>
            <Table.Cell>
              <TextInput type="number" name="500" onChange={handleChange} />
            </Table.Cell>
            <Table.Cell>{` ${total[500] ? formatNumber.format(total[500]) : 0}`}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>$200</Table.Cell>
            <Table.Cell>
              <TextInput type="number" name="200" onChange={handleChange} />
            </Table.Cell>
            <Table.Cell>{` ${total[200] ? formatNumber.format(total[200]) : 0}`}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>$100</Table.Cell>
            <Table.Cell>
              <TextInput type="number" name="100" onChange={handleChange} />
            </Table.Cell>
            <Table.Cell>{`${total[100] ? formatNumber.format(total[100]) : 0}`}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>$50</Table.Cell>
            <Table.Cell>
              <TextInput type="number" name="50" onChange={handleChange} />
            </Table.Cell>
            <Table.Cell>{`${total[50] ? formatNumber.format(total[50]) : 0}`}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>$20</Table.Cell>
            <Table.Cell>
              <TextInput type="number" name="20" onChange={handleChange} />
            </Table.Cell>
            <Table.Cell>{`${total[20] ? formatNumber.format(total[20]) : 0}`}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell className="sr-only">NO INFO</Table.Cell>
            <Table.Cell className="text-center text-lg font-semibold">
              Total:
            </Table.Cell>
            <Table.Cell className="text-lg font-semibold">{` ${getResults()}`}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </section>
  );
}
