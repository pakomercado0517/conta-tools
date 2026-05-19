"use client";

import { Label, Textarea, Checkbox } from "flowbite-react";
import ConceptTextPreview from "@/components/ConceptTextPreview";
import type { QuotationServiceDescriptionProps } from "@/types/quotation";

/**
 * Descripción opcional del servicio (tras el saludo en el PDF).
 * El texto puede guardarse como borrador; el checkbox controla si entra en el PDF.
 */
export default function QuotationServiceDescription({
  datos,
  handleChange,
  toggleIncluirDescripcion,
}: QuotationServiceDescriptionProps) {
  return (
    <section className="mt-2 mb-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
      <h2 className="mb-2 mt-2 text-lg font-semibold text-gray-300">
        Descripción del servicio (opcional)
      </h2>
      <p className="mb-3 text-sm text-gray-400">
        Aparece en el PDF justo después del saludo solo si marcas la opción y hay
        texto.
      </p>

      <div className="mb-2 flex items-start">
        <Checkbox
          id="incluirDescripcionServicio"
          onChange={toggleIncluirDescripcion}
          checked={datos.incluirDescripcionServicio}
        />
        <Label
          htmlFor="incluirDescripcionServicio"
          className="ml-3 cursor-pointer text-sm font-medium text-gray-300"
        >
          Incluir descripción en la cotización (PDF)
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
          placeholder="Uno o varios párrafos; usa Enter para separar líneas."
        />
        <ConceptTextPreview
          text={datos.descripcionServicio}
          label="Vista en PDF (por línea):"
        />
      </div>
    </section>
  );
}
