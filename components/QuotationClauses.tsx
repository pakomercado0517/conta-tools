"use client";

import { TextInput, Button } from "flowbite-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import type { QuotationClausesProps } from "@/types/quotation";

/**
 * Componente para gestionar las cláusulas de la cotización
 * Permite agregar, editar y eliminar cláusulas dinámicamente
 *
 * @param datos - Datos del formulario de cotización
 * @param handleClausulaChange - Función para manejar cambios en cláusulas
 * @param agregarClausula - Función para agregar nueva cláusula
 * @param eliminarClausula - Función para eliminar cláusula por índice
 */
export default function QuotationClauses({
  datos,
  handleClausulaChange,
  agregarClausula,
  eliminarClausula,
}: QuotationClausesProps) {
  return (
    <section className="my-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
      <h2 className="mb-4 mt-5 text-lg font-semibold text-gray-300">
        Cláusulas
      </h2>

      {datos.clausulas.map((clausula, index) => (
        <div key={index} className="mb-3 grid grid-cols-6 gap-2">
          <div className="col-span-5">
            <TextInput
              id={`clausula-${index}`}
              placeholder={`Cláusula ${index + 1}`}
              value={clausula}
              onChange={(e) => handleClausulaChange(e, index)}
              className="text-white focus:ring-cyan-500"
            />
          </div>

          <div className="col-span-1 flex justify-center">
            <Button
              color="failure"
              size="sm"
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              onClick={() => eliminarClausula(index)}
              type="button"
              aria-label={`Eliminar cláusula ${index + 1}`}
            >
              <RiDeleteBin6Line className="text-lg" />
            </Button>
          </div>
        </div>
      ))}

      <Button onClick={agregarClausula} className="mt-4" type="button">
        Agregar Cláusula
      </Button>
    </section>
  );
}
