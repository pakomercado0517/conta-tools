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
    <section className="my-8 border-t-2 border-gray-500">
      <h2 className="mt-5 text-lg font-semibold">Cláusulas</h2>
      {datos.clausulas.map((clausula, index) => (
        <div key={index} className="grid grid-cols-2">
          <TextInput
            placeholder={`Cláusula ${index + 1}`}
            value={clausula}
            onChange={(e) => handleClausulaChange(e, index)}
            className="mb-2"
          />
          <Button
            color="failure"
            className="ml-3 flex h-10 w-10 items-center rounded-lg text-center"
            onClick={() => eliminarClausula(index)}
          >
            <RiDeleteBin6Line className="text-lg" />
          </Button>
        </div>
      ))}
      <Button onClick={agregarClausula}>Agregar Cláusula</Button>
    </section>
  );
}
