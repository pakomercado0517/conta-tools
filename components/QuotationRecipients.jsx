"use client";
import { Label, TextInput } from "flowbite-react";

export default function QuotationRecipients({ handleChange }) {
  return (
    <div className="my-8 border-t-2 border-gray-500">
      <h2 className="my-4 text-center text-xl font-semibold">Destinatario</h2>
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <Label className="text-white">Nombre Destinatario</Label>
          <TextInput
            id="destinatario"
            name="destinatario"
            onChange={handleChange}
            placeholder="A quién va dirigido"
          />
        </div>
        <div>
          <Label className="text-white">
            Empresa Destinatario &#40;Opcional&#41;
          </Label>
          <TextInput
            id="destinatarioEmpresa"
            name="destinatarioEmpresa"
            onChange={handleChange}
            placeholder="Empresa a quién va dirigido"
          />
        </div>
      </section>
    </div>
  );
}
