"use client";
import { Label, TextInput } from "flowbite-react";
import { FaUser } from "react-icons/fa6";
import { LuFactory } from "react-icons/lu";

export default function QuotationRecipients({ handleChange }) {
  return (
    <div className="my-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
      <h2 className="my-4 text-center text-xl font-semibold text-gray-300">
        Destinatario
      </h2>
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <Label className="mb-1 text-sm font-medium text-gray-300">
            Nombre Destinatario
          </Label>
          <TextInput
            id="destinatario"
            name="destinatario"
            icon={LuFactory}
            onChange={handleChange}
            placeholder="A quién va dirigido"
            className="text-white focus:ring-cyan-500"
          />
        </div>
        <div>
          <Label className="mb-1 text-sm font-medium text-gray-300">
            Empresa Destinatario &#40;Opcional&#41;
          </Label>
          <TextInput
            id="destinatarioEmpresa"
            name="destinatarioEmpresa"
            icon={FaUser}
            onChange={handleChange}
            placeholder="Empresa a quién va dirigido"
            className="text-white focus:ring-cyan-500"
          />
        </div>
      </section>
    </div>
  );
}
