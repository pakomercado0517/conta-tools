"use client";

import { Label, Textarea, Checkbox } from "flowbite-react";
import type { QuotationServiceDescriptionProps } from "@/types/quotation";

/**
 * Descripción opcional del servicio, después del saludo en el PDF.
 * Entra al documento si el interruptor está activo y hay texto.
 */
export default function QuotationServiceDescription({
  datos,
  handleChange,
  toggleIncluirDescripcion,
}: QuotationServiceDescriptionProps) {
  return (
    <div className="mt-5">
      <h3 className="text-base font-semibold text-gray-200">
        Descripción del servicio
      </h3>
      <p className="mb-3 mt-1 text-sm text-gray-400">
        Si escribes aquí y dejas la opción activa, el texto sale en negrita
        después del saludo.
      </p>

      <div className="mb-3 flex items-start">
        <Checkbox
          id="incluirDescripcionServicio"
          onChange={toggleIncluirDescripcion}
          checked={datos.incluirDescripcionServicio}
        />
        <Label
          htmlFor="incluirDescripcionServicio"
          className="ml-3 cursor-pointer text-sm font-medium text-gray-300"
        >
          Incluir en el PDF
        </Label>
      </div>

      <div>
        <Label
          htmlFor="descripcionServicio"
          className="mb-1 text-sm font-medium text-gray-300"
        >
          Texto
        </Label>
        <Textarea
          id="descripcionServicio"
          name="descripcionServicio"
          onChange={handleChange}
          value={datos.descripcionServicio}
          rows={6}
          className="text-white focus:ring-cyan-500"
          placeholder="Uno o varios párrafos. Usa Enter para separar líneas. Si apagas «Incluir en el PDF», el texto se queda como borrador."
        />
      </div>
    </div>
  );
}
