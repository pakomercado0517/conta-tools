"use client";
import { TextInput, Button } from "flowbite-react";
import { RiDeleteBin6Line } from "react-icons/ri";
export default function QuotationClauses({
  datos,
  handleClausulaChange,
  agregarClausula,
  eliminarClausula,
}) {
  return (
    <section className="my-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
      <h2 className="mb-4 mt-5 text-lg font-semibold text-gray-300">
        Cláusulas
      </h2>
      {datos.clausulas.map((clausula, index) => (
        <div key={index} className="grid grid-cols-6">
          <div className="col-span-5">
            <TextInput
              placeholder={`Cláusula ${index + 1}`}
              value={clausula}
              onChange={(e) => handleClausulaChange(e, index)}
              className="mb-2 text-white focus:ring-cyan-500"
            />
          </div>
          <div className="col-span-1">
            <Button
              color="failure"
              className="ml-3 flex h-10 w-10 items-center rounded-lg text-center"
              onClick={() => eliminarClausula(index)}
            >
              <RiDeleteBin6Line className="text-lg" />
            </Button>
          </div>
        </div>
      ))}
      <Button onClick={agregarClausula} className="mt-4">
        Agregar Cláusula
      </Button>
    </section>
  );
}
