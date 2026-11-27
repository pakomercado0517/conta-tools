"use client";

import { Label, TextInput, Checkbox } from "flowbite-react";
import type { QuotationDataBankProps } from "@/types/quotation";

/**
 * Datos bancarios opcionales. El bloque permanece cerrado hasta activarlo.
 */
export default function QuotationDataBank({
  handleDataBankChange,
  showDataBank,
  datos,
  dataBank,
}: QuotationDataBankProps) {
  return (
    <section className="my-8 rounded-lg border border-dashed border-gray-600 bg-gray-900/30 p-6">
      <div className="flex items-start">
        <Checkbox
          id="showBankData"
          onChange={showDataBank}
          checked={datos.bank}
          className="mt-1"
        />
        <div className="ml-3">
          <Label
            htmlFor="showBankData"
            className="cursor-pointer text-sm font-medium text-gray-300"
          >
            Agregar datos para pago
          </Label>
          <p className="mt-1 text-sm text-gray-500">
            Opcional. Si lo activas, salen en el documento después de las
            cláusulas.
          </p>
        </div>
      </div>

      {datos.bank && (
        <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="nombreBanco"
              className="mb-1 text-sm font-medium text-gray-300"
            >
              Nombre del Banco
            </Label>
            <TextInput
              id="nombreBanco"
              name="Nombre del Banco"
              onChange={handleDataBankChange}
              value={String(dataBank["Nombre del Banco"] ?? "")}
              className="text-white focus:ring-cyan-500"
              placeholder="Nombre del banco"
            />
          </div>

          <div>
            <Label
              htmlFor="numeroCuenta"
              className="mb-1 text-sm font-medium text-gray-300"
            >
              Número de cuenta
            </Label>
            <TextInput
              id="numeroCuenta"
              name="Número de cuenta"
              type="text"
              onChange={handleDataBankChange}
              value={
                dataBank["Número de cuenta"] === 0
                  ? ""
                  : String(dataBank["Número de cuenta"] ?? "")
              }
              className="text-white focus:ring-cyan-500"
              placeholder="Número de cuenta"
              pattern="[0-9]*"
              maxLength={18}
            />
          </div>

          <div className="sm:col-span-2">
            <Label
              htmlFor="clabeInterbancaria"
              className="mb-1 text-sm font-medium text-gray-300"
            >
              Clabe Interbancaria
            </Label>
            <TextInput
              id="clabeInterbancaria"
              name="Clabe Interbancaria"
              type="text"
              onChange={handleDataBankChange}
              value={
                dataBank["Clabe Interbancaria"] === 0
                  ? ""
                  : String(dataBank["Clabe Interbancaria"] ?? "")
              }
              className="text-white focus:ring-cyan-500"
              placeholder="CLABE (18 dígitos)"
              pattern="[0-9]{18}"
              maxLength={18}
            />
          </div>
        </form>
      )}
    </section>
  );
}
