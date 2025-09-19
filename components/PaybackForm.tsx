"use client";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Button, Label, TextInput, Select, Checkbox } from "flowbite-react";
import CurrencyInput from "react-currency-input-field";
import useCreatePDF from "@/hooks/useCreatePDF";
import PaybackTable from "./PaybackTable";
import PaybackDiscounts from "./PaybackDiscounts";
import PdfTableButton from "./PdfTableButton";
import { LuFactory } from "react-icons/lu";
import { TbSquareRoundedPercentage, TbReceiptTax } from "react-icons/tb";

// Tipos para el formulario de payback
interface PaybackFormData {
  name: string;
  percentage: string;
  total: string;
  beforeTax: boolean;
}

// Tipos para el resultado del cálculo
interface PaybackResult {
  percentage: string;
  beforeTax: boolean;
  empresa: string;
  monto: number;
  comision: number;
  total: number;
  // Permitir índices de string para compatibilidad con PDFData
  [key: string]: string | number | boolean | undefined;
}

// Tipos para los descuentos
interface PaybackDiscount {
  total: number;
  date: string;
  concept: string;
}

/**
 * Componente de formulario para cálculos de payback
 * Permite calcular montos de devolución con descuentos opcionales
 */
export default function PaybackForm() {
  const [getTotal, setGetTotal] = useState<PaybackResult | null>(null);
  const [data, setData] = useState<Partial<PaybackFormData>>({});
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [cell, setCell] = useState<PaybackResult[]>([]);
  const [editingRow, setEditingRow] = useState<PaybackResult | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [discount, setDiscount] = useState<PaybackDiscount[]>([
    {
      total: 0,
      date: "",
      concept: "",
    },
  ]);
  const createDocument = useCreatePDF();

  useEffect(() => {
    if (Object.keys(data).length !== 0 && data.name && data.percentage && data.total) {
      // Convert percentage and total to numbers for calculations
      const percentage = parseFloat(data.percentage) || 0;
      const total = parseFloat(data.total) || 0;
      if (!data.beforeTax) {
        const totalMount = total * (1 - percentage / 100);
        const comision = total * (percentage / 100);
        setGetTotal({
          percentage: data.percentage || "",
          beforeTax: data.beforeTax || false,
          empresa: data.name || "",
          monto: total,
          comision: comision,
          total: totalMount,
        });
      } else {
        const montoAntesIVA = total / 1.16;
        const getComision = (montoAntesIVA * percentage) / 100;
        const costTotal = total - getComision;
        setGetTotal({
          beforeTax: data.beforeTax || false,
          percentage: data.percentage || "",
          empresa: data.name || "",
          monto: total,
          comision: getComision,
          total: costTotal,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, cell]);

  /**
   * Maneja los cambios en los inputs del formulario
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  /**
   * Edita los datos del formulario con valores externos
   */
  const editData = (arr: Partial<PaybackFormData>): void => {
    setData(arr);
  };

  /**
   * Maneja el cambio del checkbox de descuentos
   */
  const handleCheck = (event: ChangeEvent<HTMLInputElement>): void => {
    setIsChecked(event.target.checked);
  };

  /**
   * Convierte PaybackResult a PDFData
   */
  const paybackResultToPDFData = (result: PaybackResult): import('@/hooks/useCreatePDF').PDFData => {
    return {
      empresa: result.empresa,
      percentage: result.percentage,
      beforeTax: result.beforeTax ? 'Sí' : 'No',
      monto: result.monto,
      comision: result.comision,
      total: result.total,
    };
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (getTotal) {
      const pdfData = paybackResultToPDFData(getTotal);
      createDocument.createDocument(pdfData);
    }
  };

  /**
   * Añade o actualiza una celda en la tabla
   */
  const addCell = (e: FormEvent, arr: PaybackResult): void => {
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
      beforeTax: false,
    });
    setEditingRow(null);
    setEditingIndex(null);
  };
  
  /**
   * Maneja la edición de una fila de la tabla
   */
  const handleEditRow = (row: PaybackResult, index: number): void => {
    setEditingRow(row);
    setEditingIndex(index);
    setData({
      name: row.empresa || "",
      percentage: row.percentage || "",
      total: row.monto?.toString() || "",
      beforeTax: row.beforeTax || false,
    });
  };

  /**
   * Maneja el input de moneda
   */
  const handleCurrencyInput = (value: string | undefined): void => {
    setData({
      ...data,
      total: value === undefined ? "" : value,
    });
  };

  /**
   * Maneja el cambio del selector de impuestos
   */
  const handleTax = (e: ChangeEvent<HTMLSelectElement>): void => {
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
                className="text-white focus:ring-cyan-500 dark:bg-gray-800"
                placeholder=" "
required
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
                className="text-white focus:ring-cyan-500 dark:bg-gray-800"
                icon={TbSquareRoundedPercentage}
                placeholder=" "
required
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
                className="text-white focus:ring-cyan-500 dark:bg-gray-800"
required
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
                className="w-full rounded-lg bg-gray-100 px-3 py-2.5 text-sm text-white focus:ring-cyan-500 dark:border dark:border-gray-600 dark:bg-gray-700"
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
              />
            </div>
            <div className="mt-4">
              <Button
                className="bg-cyan-600 font-semibold text-white hover:bg-cyan-700"
                onClick={(e) => getTotal && addCell(e, getTotal)}
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
