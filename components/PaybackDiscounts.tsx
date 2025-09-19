"use client";
import { Label, TextInput, Button } from "flowbite-react";
import { ChangeEvent } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";

// Tipos para los descuentos
interface PaybackDiscount {
  total: number;
  date: string;
  concept: string;
}

// Props del componente
interface PaybackDiscountsProps {
  discount: PaybackDiscount[];
  setDiscount: React.Dispatch<React.SetStateAction<PaybackDiscount[]>>;
}

/**
 * Componente para manejar descuentos en cálculos de payback
 * Permite agregar, editar y eliminar descuentos
 */
export default function PaybackDiscounts({ discount, setDiscount }: PaybackDiscountsProps) {
  /**
   * Maneja los cambios en los inputs de descuento
   */
  const handleDiscountChange = (e: ChangeEvent<HTMLInputElement>, index: number): void => {
    const { value, name } = e.target;
    const newDiscount = [...discount];
    newDiscount[index] = {
      ...newDiscount[index],
      [name]: name === "total" ? parseFloat(value) || 0 : value,
    };
    setDiscount(newDiscount);
  };

  /**
   * Agrega un nuevo descuento
   */
  const agregateDiscount = (): void => {
    setDiscount((prevData) => [
      ...prevData,
      { total: 0, date: "", concept: "" },
    ]);
  };

  /**
   * Elimina un descuento por índice
   */
  const deleteDiscount = (index: number): void => {
    setDiscount((prevData) => prevData.filter((_, i) => i !== index));
  };

  return (
    <section className="my-5">
      <h2 className="mb-4 text-center text-xl font-semibold text-gray-300">
        Descuentos
      </h2>
      <div className="">
        {discount.map((el, index) => (
          <section className="grid gap-5 md:grid-cols-4" key={index}>
            <div>
              <Label>Monto</Label>
              <TextInput
                type="number"
                placeholder="$"
                name="total"
                value={el.total?.toString() || ""}
                onChange={(e) => handleDiscountChange(e, index)}
              />
            </div>
            <div>
              <Label>Fecha</Label>
              <TextInput
                type="date"
                name="date"
                value={el.date}
                onChange={(e) => handleDiscountChange(e, index)}
              />
            </div>
            <div>
              <Label>Concepto &#40;opcional&#41;</Label>
              <TextInput
                placeholder="Ej. Pago trabajador..."
                name="concept"
                value={el.concept}
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
