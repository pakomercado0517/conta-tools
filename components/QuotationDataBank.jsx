"use client";

import { Label, Select, TextInput, Checkbox } from "flowbite-react";

export default function QuotationDataBank({
  handleDataBankChange,
  showDataBank,
  datos,
}) {
  return (
    <section className="my-8 border-t-2 border-gray-500">
      <div className="mb-7 mt-5">
        <Checkbox onChange={showDataBank} />
        <Label
          className="ml-3 text-white"
          value="Datos Bancarios (Marca la casilla si quieres agregar datos bancarios)"
        />
      </div>
      {/* <Select onChange={showDataBank} className="max-w-sm">
        <option value="">Seleccionar</option>
        <option value="Si">Si</option>
        <option value="No">No</option>
      </Select> */}
      <section>
        {datos.bank && (
          <form className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <Label className="text-white" value="Nombre del Banco" />
              <TextInput
                id="Nombre del Banco"
                name="Nombre del Banco"
                onChange={handleDataBankChange}
              />
            </div>
            <div>
              <Label className="text-white" value="Número de cuenta" />
              <TextInput
                id="Número de Cuenta"
                name="Número de Cuenta"
                type="number"
                onChange={handleDataBankChange}
              />
            </div>
            <div>
              <Label className="text-white" value="Clabe Interbancaria" />
              <TextInput
                id="Clabe Interbancaria"
                name="Clabe Interbancaria"
                typo="number"
                onChange={handleDataBankChange}
              />
            </div>
          </form>
        )}
      </section>
    </section>
  );
}
