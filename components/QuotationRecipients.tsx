"use client";

import { Label, TextInput } from "flowbite-react";
import { FaUser } from "react-icons/fa6";
import { LuFactory } from "react-icons/lu";
import type { QuotationRecipientsProps } from "@/types/quotation";

/**
 * Componente para capturar información del destinatario de la cotización
 * 
 * @param handleChange - Función para manejar cambios en los inputs
 */
export default function QuotationRecipients({ 
  handleChange 
}: QuotationRecipientsProps) {
  return (
    <div className="my-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
      <h2 className="my-4 text-center text-xl font-semibold text-gray-300">
        Destinatario
      </h2>
      
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
            icon={LuFactory}
            onChange={handleChange}
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