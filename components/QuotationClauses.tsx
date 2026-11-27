"use client";

import { Textarea, Button } from "flowbite-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import type { QuotationClausesProps } from "@/types/quotation";

/**
 * Cláusulas del cierre de la cotización.
 */
export default function QuotationClauses({
  datos,
  handleClausulaChange,
  agregarClausula,
  eliminarClausula,
}: QuotationClausesProps) {
  return (
    <section className="my-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
      <h2 className="text-xl font-semibold text-gray-200">4. Cierre</h2>
      <p className="mb-5 mt-1 text-sm text-gray-400">
        Cláusulas, datos de pago, despedida y firma, después del total.
      </p>

      <h3 className="mb-3 text-base font-semibold text-gray-200">Cláusulas</h3>

      {datos.clausulas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-600 px-4 py-6">
          <p className="mb-4 text-sm text-gray-400">
            Cada cláusula sale con un asterisco, debajo de la tabla. Agrega las
            que quieras incluir.
          </p>
          <Button onClick={agregarClausula} type="button">
            Agregar cláusula
          </Button>
        </div>
      ) : (
        <>
          {datos.clausulas.map((clausula, index) => (
            <div key={index} className="mb-3 flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <Textarea
                  id={`clausula-${index}`}
                  placeholder={`Cláusula ${index + 1}`}
                  value={clausula}
                  rows={3}
                  onChange={(e) => handleClausulaChange(e, index)}
                  className="text-white focus:ring-cyan-500"
                />
              </div>
              <Button
                color="failure"
                size="sm"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                onClick={() => eliminarClausula(index)}
                type="button"
                aria-label={`Eliminar cláusula ${index + 1}`}
              >
                <RiDeleteBin6Line className="text-lg" />
              </Button>
            </div>
          ))}

          <Button onClick={agregarClausula} className="mt-2" type="button">
            Agregar cláusula
          </Button>
        </>
      )}
    </section>
  );
}
