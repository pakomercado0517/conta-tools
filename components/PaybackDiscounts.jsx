"use client";
import { useState } from "react";
import { Label, TextInput, Button } from "flowbite-react";

export default function PaybackDiscounts({ discount, setDiscount }) {
  const handleDiscountChange = (e, index) => {
    const { value, name } = e.target;
    const newDiscount = [...discount];
    newDiscount[index] = {
      ...newDiscount[index],
      [name]: name === "total" ? parseFloat(value) : value,
    };
    setDiscount(newDiscount);
  };

  const agregateDiscount = () => {
    setDiscount((prevData) => [
      ...prevData,
      { total: 0, date: "", concept: "" },
    ]);
  };

  return (
    <section className="my-5">
      <h2 className="mb-4 text-center text-xl font-semibold">Descuentos</h2>
      <div className="">
        {discount.map((el, index) => (
          <section className="grid gap-5 md:grid-cols-3" key={index}>
            <div>
              <Label>Monto</Label>
              <TextInput
                type="number"
                placeholder="$"
                name="total"
                initialvalue={el.total}
                onChange={(e) => handleDiscountChange(e, index)}
              />
            </div>
            <div>
              <Label>Fecha</Label>
              <TextInput
                type="date"
                name="date"
                initialvalue={el.date}
                onChange={(e) => handleDiscountChange(e, index)}
              />
            </div>
            <div>
              <Label>Concepto &#40;opcional&#41;</Label>
              <TextInput
                placeholder="Ej. Pago trabajador..."
                name="concept"
                initialvalue={el.concept}
                onChange={(e) => handleDiscountChange(e, index)}
              />
            </div>
          </section>
        ))}
      </div>
      <Button onClick={agregateDiscount}>Agregar Descuento</Button>
    </section>
  );
}
