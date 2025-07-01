"use client";

import { Label, Select, TextInput, Checkbox } from "flowbite-react";

export default function QuotationDataBank({
  handleDataBankChange,
  showDataBank,
  datos,
}) {
  return (
    <section className="my-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
      <div className="mb-7 mt-5">
        <Checkbox onChange={showDataBank} />
        <Label
          className="ml-3 text-sm font-medium text-gray-300"
          value="Datos Bancarios (Marca la casilla si quieres agregar datos bancarios)"
        />
      </div>
      <section>
        {datos.bank && (
          <form className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <Label
                className="mb-1 text-sm font-medium text-gray-300"
                value="Nombre del Banco"
              />
              <TextInput
                id="Nombre del Banco"
                name="Nombre del Banco"
                onChange={handleDataBankChange}
                className="text-white focus:ring-cyan-500"
              />
            </div>
            <div>
              <Label
                className="mb-1 text-sm font-medium text-gray-300"
                value="Número de cuenta"
              />
              <TextInput
                id="Número de Cuenta"
                name="Número de Cuenta"
                type="number"
                onChange={handleDataBankChange}
                className="text-white focus:ring-cyan-500"
              />
            </div>
            <div>
              <Label
                className="mb-1 text-sm font-medium text-gray-300"
                value="Clabe Interbancaria"
              />
              <TextInput
                id="Clabe Interbancaria"
                name="Clabe Interbancaria"
                typo="number"
                onChange={handleDataBankChange}
                className="text-white focus:ring-cyan-500"
              />
            </div>
          </form>
        )}
      </section>
    </section>
  );
}
