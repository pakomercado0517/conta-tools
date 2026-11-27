"use client";

import { Label, TextInput } from "flowbite-react";
import QuotationDisclosure from "@/components/QuotationDisclosure";
import useFormatNumber from "@/hooks/useFormatNumber";
import {
  computeQuotationSummary,
  quotationSummaryLabels,
  textoCantidadConLetra,
} from "@/lib/quotationTotals";
import type { QuotationSummaryLabelsProps } from "@/types/quotation";

/**
 * Resumen numérico en vivo, con las mismas cifras y etiquetas que el PDF.
 * Los textos del total se editan en un bloque cerrado.
 */
export default function QuotationSummaryLabels({
  datos,
  onChangeField,
}: QuotationSummaryLabelsProps) {
  const formatNumber = useFormatNumber();
  const summary = computeQuotationSummary(datos.productos);
  const labels = quotationSummaryLabels(datos);
  const cantidadLetra = textoCantidadConLetra(
    summary.totalFinal,
    labels.prefijoCantidadLetra
  );

  return (
    <section className="my-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
      <h2 className="text-lg font-semibold text-gray-200">Total</h2>
      <p className="mb-4 mt-1 text-sm text-gray-400">
        Así se verá el resumen bajo la tabla. Se actualiza con las partidas.
      </p>

      <dl className="space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-gray-300">{labels.etiquetaSubtotal}</dt>
          <dd className="font-medium text-gray-100">
            {formatNumber.format(summary.subtotal)}
          </dd>
        </div>
        {summary.taxRows.map((row) => (
          <div
            key={row.key}
            className="flex items-baseline justify-between gap-4"
          >
            <dt className="text-gray-300">{row.etiquetaPdf}</dt>
            <dd className="font-medium text-gray-100">
              {formatNumber.format(row.monto)}
            </dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 border-t border-gray-700 pt-2">
          <dt className="font-semibold text-gray-100">{labels.etiquetaTotal}</dt>
          <dd className="text-base font-semibold text-white">
            {formatNumber.format(summary.totalFinal)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-gray-300">{cantidadLetra}</p>

      <div className="mt-5">
        <QuotationDisclosure title="Personalizar textos del total">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                onChange={(e) =>
                  onChangeField("etiquetaSubtotal", e.target.value)
                }
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
            <div className="sm:col-span-2">
              <Label
                htmlFor="textoCantidadLetra"
                className="mb-1 text-sm font-medium text-gray-300"
              >
                Texto previo al importe en letras
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
        </QuotationDisclosure>
      </div>
    </section>
  );
}
