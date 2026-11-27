"use client";

import { Label, TextInput } from "flowbite-react";
import { FaUser } from "react-icons/fa6";
import { LuFactory } from "react-icons/lu";
import type { QuotationRecipientsProps } from "@/types/quotation";

/**
 * Destinatario de la cotización, debajo de la fecha en el PDF.
 */
export default function QuotationRecipients({
  datos,
  handleChange,
}: QuotationRecipientsProps) {
  return (
    <div className="mt-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
      <h2 className="text-xl font-semibold text-gray-200">Destinatario</h2>
      <p className="mb-5 mt-1 text-sm text-gray-400">
        Aparece debajo de la fecha: primero la empresa, luego el nombre.
      </p>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label
            htmlFor="destinatario"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            Nombre Destinatario
          </Label>
          <TextInput
            id="destinatario"
            name="destinatario"
            icon={FaUser}
            onChange={handleChange}
            value={datos.destinatario}
            placeholder="A quién va dirigido"
            className="text-white focus:ring-cyan-500"
            required
          />
        </div>

        <div>
          <Label
            htmlFor="destinatarioEmpresa"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            Empresa Destinatario (Opcional)
          </Label>
          <TextInput
            id="destinatarioEmpresa"
            name="destinatarioEmpresa"
            icon={LuFactory}
            onChange={handleChange}
            value={datos.destinatarioEmpresa}
            placeholder="Empresa a quién va dirigido"
            className="text-white focus:ring-cyan-500"
          />
        </div>
      </section>
    </div>
  );
}
