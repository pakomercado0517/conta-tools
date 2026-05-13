"use client";

import { Label, TextInput } from "flowbite-react";
import type { QuotationSummaryLabelsProps } from "@/types/quotation";

/**
 * Etiquetas editables del resumen numérico en el PDF (subtotal, total, cantidad con letra).
 * Actualización por campo explícita (evita depender de `name` en eventos de Flowbite).
 */
export default function QuotationSummaryLabels({
  datos,
  onChangeField,
}: QuotationSummaryLabelsProps) {
  return (
    <section className="my-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
      <h2 className="mb-2 mt-5 text-lg font-semibold text-gray-300">
        Etiquetas del resumen (PDF)
      </h2>
      <p className="mb-5 text-sm text-gray-400">
        Personaliza los textos de las filas de totales y del monto en letras.
      </p>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div>
          <Label
            htmlFor="etiquetaSubtotal"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            Fila subtotal
          </Label>
          <TextInput
            id="etiquetaSubtotal"
            name="etiquetaSubtotal"
            value={datos.etiquetaSubtotal}
            onChange={(e) => onChangeField("etiquetaSubtotal", e.target.value)}
            className="text-white focus:ring-cyan-500"
            placeholder="Subtotal:"
          />
        </div>
        <div>
          <Label
            htmlFor="etiquetaTotal"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            Fila total
          </Label>
          <TextInput
            id="etiquetaTotal"
            name="etiquetaTotal"
            value={datos.etiquetaTotal}
            onChange={(e) => onChangeField("etiquetaTotal", e.target.value)}
            className="text-white focus:ring-cyan-500"
            placeholder="Total:"
          />
        </div>
        <div className="md:col-span-1">
          <Label
            htmlFor="textoCantidadLetra"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            Monto en letras (texto previo al importe en letras)
          </Label>
          <TextInput
            id="textoCantidadLetra"
            name="textoCantidadLetra"
            value={datos.textoCantidadLetra}
            onChange={(e) =>
              onChangeField("textoCantidadLetra", e.target.value)
            }
            className="text-white focus:ring-cyan-500"
            placeholder="Importe con letra:"
          />
        </div>
      </div>
    </section>
  );
}
