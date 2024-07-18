"use client";
import { useState, useEffect } from "react";
import { Button, Label, TextInput, Select } from "flowbite-react";
import CurrencyInput from "react-currency-input-field";
import useFormatNumber from "@/hooks/useFormatNumber";
import useCreatePDF from "@/hooks/useCreatePDF";
import PaybackTable from "./PaybackTable";

export default function PaybackForm() {
  const [getTotal, setGetTotal] = useState([]);
  const [data, setData] = useState({});
  const [beforeTax, setBeforeTax] = useState(false);
  const [cell, setCell] = useState([]);
  const formatNumber = useFormatNumber();
  const createDocument = useCreatePDF();

  useEffect(() => {
    if (data.length !== 0) {
      if (!beforeTax) {
        const totalMount = data.total * (1 - data.percentage / 100);
        const comision = data.total * `0.0${data.percentage}`;
        setGetTotal({
          empresa: data.name,
          monto: formatNumber.format(data.total),
          comision: `-${formatNumber.format(comision)}`,
          total: formatNumber.format(totalMount),
        });
      } else {
        const montoAntesIVA = data.total / 1.16;
        const getComision = (montoAntesIVA * data.percentage) / 100;
        const costTotal = data.total - getComision;

        setGetTotal({
          empresa: data.name,
          monto: formatNumber.format(data.total),
          comision: `-${formatNumber.format(getComision)}`,
          total: formatNumber.format(costTotal),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, beforeTax, cell]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    createDocument(getTotal, false);
  };

  const addCell = (arr) => {
    const $arr = [];
    $arr.push(...cell, arr);
    setCell($arr);
  };

  const handleCurrencyInput = (value) => {
    setData({
      ...data,
      total: value === undefined ? "" : value,
    });
  };

  const handleTax = (e) => {
    e.target.value === "si" ? setBeforeTax(true) : setBeforeTax(false);
  };

  return (
    <section>
      <form className="mt-5">
        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="group relative z-0 mb-6 w-full">
            <TextInput
              onChange={handleChange}
              type="text"
              name="name"
              id="name"
              className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
              placeholder=" "
              required=""
            />
            <Label
              htmlFor="name"
              className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500"
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
              className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
              placeholder=" "
              required=""
              defaultValue={data?.percentage}
            />
            <Label
              htmlFor="percentage"
              className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500"
            >
              Porcentaje
            </Label>
          </div>
          <div className="group relative z-0 mb-6 w-full">
            <Select
              onChange={handleTax}
              name="beforeTax"
              id="beforeTax"
              className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
              placeholder=" "
              required=""
            >
              <option>Selecciona una opción</option>
              <option value="si">Si</option>
              <option value="no">No</option>
            </Select>
            <Label
              htmlFor="beforeTax"
              className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500"
            >
              Antes IVA?
            </Label>
          </div>
          <div className="group relative z-0 mb-6 w-full">
            {/* <TextInput
              onChange={handleChange}
              type="text"
              name="total"
              id="total"
              className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
              placeholder=" "
              required=""
              defaultValue={formatNumber.format(data.total)}
            /> */}
            <CurrencyInput
              id="total"
              name="total"
              decimalsLimit={2}
              defaultValue={data.total}
              onValueChange={handleCurrencyInput}
              className="peer mt-3 block w-full appearance-none rounded-lg border-0 border-b-2 border-gray-300 px-0 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
              intlConfig={{ locale: "es-MX", currency: "MXN" }}
            />
            <div className="mt-2 border-b-2 border-gray-600"></div>
            <Label
              htmlFor="total"
              className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium dark:text-gray-400"
            >
              Monto
            </Label>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <Button color="dark" onClick={handleSubmit}>
            Crear PDF
          </Button>
          <Button onClick={() => addCell(getTotal)}>Agregar registro</Button>
        </div>
      </form>
      <article className="mt-10">
        {cell.length > 0 && <PaybackTable data={cell} />}
      </article>
    </section>
  );
}
