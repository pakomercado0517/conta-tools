"use client";
import { TextInput, Button } from "flowbite-react";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function QuotationProducts({
  datos,
  handleProductoChange,
  agregarProducto,
  eliminarProducto,
}) {
  return (
    <section className="my-8 border-t-2 border-gray-500">
      <h2 className="mt-5 text-lg font-semibold">Productos</h2>
      <form className="">
        {datos.productos.map((producto, index) => (
          <div
            key={index}
            className="my-3 grid grid-cols-1 gap-2 px-3 pb-3 md:grid-cols-2 lg:grid-cols-4 lg:px-0"
          >
            <TextInput
              placeholder="Cantidad"
              name="cantidad"
              value={producto.cantidad}
              onChange={(e) => handleProductoChange(e, index)}
            />
            <TextInput
              placeholder="Unidad"
              name="unidad"
              value={producto.unidad}
              onChange={(e) => handleProductoChange(e, index)}
            />
            <TextInput
              placeholder="Descripción"
              name="descripcion"
              value={producto.descripcion}
              onChange={(e) => handleProductoChange(e, index)}
            />
            <div className="flex justify-stretch">
              <TextInput
                placeholder="Precio Unitario"
                className="cols-span-1 w-3/4 lg:w-full"
                name="precioUnitario"
                type="number"
                value={producto.precioUnitario}
                onChange={(e) => handleProductoChange(e, index)}
              />
              <div>
                <Button
                  color="failure"
                  className="ml-3 flex h-10 w-10 items-center rounded-lg text-center"
                  onClick={() => eliminarProducto(index)}
                >
                  <RiDeleteBin6Line className="text-lg" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        <Button onClick={agregarProducto}>Agregar Producto</Button>
      </form>
    </section>
  );
}
