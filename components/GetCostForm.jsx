"use client";

import { useState } from "react";
import CreatePDF from "./CreatePDF";
import { Label, Button, TextInput, Table } from "flowbite-react";

export default function GetCostForm() {
  const initialState = {
    rfc: "",
    total: "",
    subtotal: "",
  };
  const [formData, setFormData] = useState(initialState);

  const [costo, setCost] = useState([]);
  const styleInput = `border border-slate-600 rounded-md my-2`;

  const handleChange = (e) => {
    e.preventDefault();
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
      subtotal: formData.total / 1.16,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const arr = [];
    const existingData = costo.find(({ rfc }) => rfc === formData.rfc);
    if (existingData) {
      // Update existing data
      const updateCosts = costo.map((c) => {
        if (c.rfc === formData.rfc) {
          return {
            ...formData,
            total: parseInt(c.total) + parseInt(formData.total),
            subtotal: c.subtotal + formData.subtotal,
          };
        }
        return c;
      });
      setCost(updateCosts);
    } else {
      // Add new data to array
      costo.length > 0 ? arr.push(...costo, formData) : arr.push(formData);
      setCost(arr);
    }
    setFormData(initialState);
  };

  const getResults = () => {
    const arr = [];
    costo.map((el) => arr.push(parseInt(el.total)));
    let total = arr.reduce((a, b) => a + b, 0);
    total = total.toString().split(".");
    total[0] = total[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return total.join(".");
  };

  const getSubtotal = (num) => {
    let result;
    result = num / 1.16;
    result = result.toFixed(2);
    result = result.toString().split(".");
    result[0] = result[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return result.join(".");
  };

  const getTotal = (num) => {
    const parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  return (
    <div className="animate-fade mx-auto mt-8">
      <form className="mx-auto max-w-xl">
        <div>
          <Label>Ingresa el RFC:</Label>
          <TextInput
            type="text"
            name="rfc"
            value={formData.rfc}
            onChange={handleChange}
          />
        </div>
        <div className="mt-3">
          <Label>Ingresa el monto del costo:</Label>
          <TextInput
            name="total"
            value={formData.total}
            type="number"
            onChange={handleChange}
          />
        </div>
        <div className="my-3 flex justify-center">
          <Button size="md" onClick={handleSubmit}>
            Agregar Gasto
          </Button>
        </div>
      </form>

      {/* Here showing the table with the data... */}
      {/* component */}

      {costo.length > 0 && (
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
                {costo.map((el) => (
                  <Table.Row key={el.rfc}>
                    <Table.Cell>{el.rfc}</Table.Cell>
                    <Table.Cell>{`$ ${getSubtotal(el.total)}`}</Table.Cell>
                    <Table.Cell>{`$ ${getTotal(el.total)}`}</Table.Cell>
                  </Table.Row>
                ))}
                <Table.Row>
                  <Table.Cell>
                    <span className="sr-only">NO INFO</span>
                  </Table.Cell>
                  <Table.Cell className="text-center text-lg font-semibold">
                    Total:
                  </Table.Cell>
                  <Table.Cell className="text-lg font-semibold">{`$ ${getResults()}`}</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </section>
          <div className="flex justify-center">
            <CreatePDF costo={costo} />
          </div>
        </>
      )}
    </div>
  );
}
