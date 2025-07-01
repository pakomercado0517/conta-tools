"use client";
import { useState, useEffect } from "react";
import { Button, Label, TextInput, Select, Checkbox } from "flowbite-react";
import CurrencyInput from "react-currency-input-field";
import useCreatePDF from "@/hooks/useCreatePDF";
import PaybackTable from "./PaybackTable";
import PaybackDiscounts from "./PaybackDiscounts";
import PdfTableButton from "./PdfTableButton";
import { LuFactory } from "react-icons/lu";
import { TbSquareRoundedPercentage, TbReceiptTax } from "react-icons/tb";

export default function PaybackForm() {
  const [getTotal, setGetTotal] = useState([]);
  const [data, setData] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [cell, setCell] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [discount, setDiscount] = useState([
    {
      total: 0,
      date: "",
      concept: "",
    },
  ]);
  const createDocument = useCreatePDF();

  useEffect(() => {
    if (data.length !== 0) {
      // Convert percentage and total to numbers for calculations
      const percentage = parseFloat(data.percentage) || 0;
      const total = parseFloat(data.total) || 0;
      if (!data.beforeTax) {
        const totalMount = total * (1 - percentage / 100);
        const comision = total * (percentage / 100);
        setGetTotal({
          percentage: data.percentage,
          beforeTax: data.beforeTax,
          empresa: data.name,
          monto: total,
          comision: comision,
          total: totalMount,
        });
      } else {
        const montoAntesIVA = total / 1.16;
        const getComision = (montoAntesIVA * percentage) / 100;
        const costTotal = total - getComision;
        setGetTotal({
          beforeTax: data.beforeTax,
          percentage: data.percentage,
          empresa: data.name,
          monto: total,
          comision: getComision,
          total: costTotal,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, cell]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const editData = (arr) => {
    setData(arr);
  };

  const handleCheck = (event) => {
    setIsChecked(event.target.checked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    createDocument(getTotal, false);
  };

  const addCell = (e, arr) => {
    e.preventDefault();
    if (editingIndex !== null) {
      const updated = [...cell];
      updated[editingIndex] = arr;
      setCell(updated);
    } else {
      setCell([...cell, arr]);
    }
    setData({
      name: "",
      percentage: "",
      total: "",
      beforeTax: "",
    });
    setEditingRow(null);
    setEditingIndex(null);
  };
  const handleEditRow = (row, index) => {
    setEditingRow(row);
    setEditingIndex(index);
    setData({
      name: row.empresa || "",
      percentage: row.percentage || "",
      total: row.monto || "",
      beforeTax: row.beforeTax || false,
    });
  };

  const handleCurrencyInput = (value) => {
    setData({
      ...data,
      total: value === undefined ? "" : value,
    });
  };

  const handleTax = (e) => {
    setData({
      ...data,
      beforeTax: e.target.value === "si" ? true : false,
    });
  };

  return (
    <section>
      <div className="rounded-xl bg-gray-900/60 p-6 shadow-md">
        <form className="mt-5">
          <div className="grid md:grid-cols-2 md:gap-6">
            <div className="group relative z-0 mb-6 w-full">
              <TextInput
                onChange={handleChange}
                type="text"
                name="name"
                id="name"
                className="bg-gray-800 text-white focus:ring-cyan-500"
                placeholder=" "
                required=""
                icon={LuFactory}
                value={data?.name || ""}
              />
              <Label
                htmlFor="name"
                className="mb-1 text-sm font-medium text-gray-300"
              >
                Nombre de la empresa
              </Label>
            </div>
            <div className="group relative z-0 mb-6 w-full">
              <TextInput
                onChange={handleChange}
                type="number"
                name="percentage"
                id="percentage"
                className="bg-gray-800 text-white focus:ring-cyan-500"
                icon={TbSquareRoundedPercentage}
                placeholder=" "
                required=""
                value={data?.percentage || ""}
              />
              <Label
                htmlFor="percentage"
                className="mb-1 text-sm font-medium text-gray-300"
              >
                Porcentaje
              </Label>
            </div>
            <div className="group relative z-0 mb-6 w-full">
              <Select
                onChange={handleTax}
                name="beforeTax"
                id="beforeTax"
                className="bg-gray-800 text-white focus:ring-cyan-500"
                placeholder=" "
                required=""
                value={
                  data?.beforeTax !== undefined
                    ? !data.beforeTax
                      ? "no"
                      : "si"
                    : ""
                }
                icon={TbReceiptTax}
              >
                <option>Selecciona una opción</option>
                <option value="si">Si</option>
                <option value="no">No</option>
              </Select>
              <Label
                htmlFor="beforeTax"
                className="mb-1 text-sm font-medium text-gray-300"
              >
                Antes IVA?
              </Label>
            </div>
            <div className="group relative z-0 mb-6 w-full">
              <CurrencyInput
                id="total"
                name="total"
                placeholder=" $0.00"
                decimalsLimit={2}
                value={data?.total || ""}
                onValueChange={handleCurrencyInput}
                className="w-full rounded-lg bg-gray-800 px-3 py-2.5 text-sm text-white focus:ring-cyan-500"
                intlConfig={{ locale: "es-MX", currency: "MXN" }}
              />
              <Label
                htmlFor="total"
                className="mb-1 text-sm font-medium text-gray-300"
              >
                Monto
              </Label>
            </div>
          </div>
          <div>
            <Checkbox id="discounts" onChange={handleCheck} />
            <Label className="mb-1 ml-4 text-sm font-medium text-gray-300">
              Quieres añadir descuentos al total?
            </Label>
          </div>
          <div>
            {isChecked && (
              <PaybackDiscounts discount={discount} setDiscount={setDiscount} />
            )}
          </div>
          <div className="align-center flex justify-center gap-4">
            {/* <Button color="dark" onClick={handleSubmit}>
              Crear PDF
            </Button> */}
            <div>
              <PdfTableButton
                data={cell}
                discount={discount}
                isChecked={isChecked}
                setCell={setCell}
              />
            </div>
            <div className="mt-4">
              <Button
                className="bg-cyan-600 font-semibold text-white hover:bg-cyan-700"
                onClick={(e) => addCell(e, getTotal)}
              >
                {editingIndex !== null
                  ? "Actualizar registro"
                  : "Agregar registro"}
              </Button>
            </div>
          </div>
        </form>
      </div>
      <article className="mt-10">
        {cell.length > 0 && (
          <PaybackTable
            data={cell}
            discount={discount}
            isChecked={isChecked}
            setCell={setCell}
            onEdit={handleEditRow}
          />
        )}
      </article>
    </section>
  );
}
