"use client";

import { Label, TextInput, Checkbox } from "flowbite-react";
import type { QuotationDataBankProps } from "@/types/quotation";

/**
 * Componente para capturar datos bancarios opcionales en la cotización
 *
 * @param handleDataBankChange - Función para manejar cambios en datos bancarios
 * @param showDataBank - Función para mostrar/ocultar formulario bancario
 * @param datos - Datos del formulario de cotización
 */
export default function QuotationDataBank({
  handleDataBankChange,
  showDataBank,
  datos,
}: QuotationDataBankProps) {
  return (
    <section className="my-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
      <div className="mb-7 mt-5 flex items-center">
        <Checkbox
          id="showBankData"
          onChange={showDataBank}
          checked={datos.bank}
        />
        <Label
          htmlFor="showBankData"
          className="ml-3 cursor-pointer text-sm font-medium text-gray-300"
        >
          Datos Bancarios (Marca la casilla si quieres agregar datos bancarios)
        </Label>
      </div>

      <section>
        {datos.bank && (
          <form className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                className="text-white focus:ring-cyan-500"
                placeholder="Número de cuenta"
                pattern="[0-9]*"
                maxLength={18}
              />
            </div>

            <div>
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
                className="text-white focus:ring-cyan-500"
                placeholder="CLABE (18 dígitos)"
                pattern="[0-9]{18}"
                maxLength={18}
              />
            </div>
          </form>
        )}
      </section>
    </section>
  );
}
