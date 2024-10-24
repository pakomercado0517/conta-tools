"use client";
import { Label, TextInput, Button } from "flowbite-react";
import CurrencyInput from "react-currency-input-field";
import { RiDeleteBin6Line } from "react-icons/ri";

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

  const deleteDiscount = (index) => {
    setDiscount((prevData) => prevData.filter((_, i) => i !== index));
  };

  return (
    <section className="my-5">
      <h2 className="mb-4 text-center text-xl font-semibold">Descuentos</h2>
      <div className="">
        {discount.map((el, index) => (
          <section className="grid gap-5 md:grid-cols-4" key={index}>
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
            <div className="mt-5 flex items-center">
              <Button
                color="failure"
                className="ml-3 flex h-10 w-10 items-center rounded-lg bg-transparent text-center"
                onClick={() => deleteDiscount(index)}
              >
                <RiDeleteBin6Line className="p-0 text-lg" />
              </Button>
            </div>
          </section>
        ))}
      </div>
      <Button className="mt-3" onClick={agregateDiscount}>
        Agregar Descuento
      </Button>
    </section>
  );
}
