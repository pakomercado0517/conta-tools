"use client";
import { TextInput, Button } from "flowbite-react";

export default function QuotationProducts({
  datos,
  handleProductoChange,
  agregarProducto,
}) {
  return (
    <section className="my-8 border-t-2 border-gray-500">
      <h2 className="mt-5 text-lg font-semibold">Productos</h2>
      <form className="">
        {datos.productos.map((producto, index) => (
          <div
            key={index}
            className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-4"
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
            <TextInput
              placeholder="Precio Unitario"
              name="precioUnitario"
              type="number"
              value={producto.precioUnitario}
              onChange={(e) => handleProductoChange(e, index)}
            />
          </div>
        ))}
        <Button onClick={agregarProducto}>Agregar Producto</Button>
      </form>
    </section>
  );
}
