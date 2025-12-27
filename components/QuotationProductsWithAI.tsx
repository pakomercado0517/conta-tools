"use client";
import { TextInput, Button } from "flowbite-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { ChangeEvent, MouseEvent } from "react";
import AIGeneratorButton from "@/components/AIGeneratorButton";
import type {
  QuotationFormData,
  QuotationProductChangeHandler,
} from "@/types/quotation";

// Tipos para las props del componente
interface QuotationProductsWithAIProps {
  datos: QuotationFormData;
  handleProductoChange: QuotationProductChangeHandler;
  agregarProducto: (e: MouseEvent<HTMLButtonElement>) => void;
  eliminarProducto: (index: number) => void;
}

/**
 * Componente para manejar productos en cotizaciones con asistencia de IA
 * Permite agregar, editar y eliminar productos, con generación automática de descripciones
 */
export default function QuotationProductsWithAI({
  datos,
  handleProductoChange,
  agregarProducto,
  eliminarProducto,
}: QuotationProductsWithAIProps) {
  /**
   * Maneja el contenido generado por la IA
   * Simula un evento de cambio para actualizar la descripción del producto
   */
  const handleAIGenerated = (generatedContent: string, index: number): void => {
    // Simular un evento de cambio para actualizar la descripción
    const syntheticEvent: ChangeEvent<HTMLInputElement> = {
      target: {
        name: "descripcion",
        value: generatedContent,
      } as HTMLInputElement,
    } as ChangeEvent<HTMLInputElement>;

    handleProductoChange(syntheticEvent, index);
  };

  return (
    <section className="my-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
      <h2 className="mb-4 mt-5 text-lg font-semibold text-gray-300">
        Productos
      </h2>
      <form className="">
        {datos.productos.map((producto, index) => (
          <div
            key={index}
            className="my-3 grid grid-cols-1 gap-2 px-3 pb-3 md:grid-cols-2 lg:px-0"
          >
            <TextInput
              placeholder="Cantidad"
              name="cantidad"
              value={producto.cantidad}
              onChange={(e) => handleProductoChange(e, index)}
              className="text-white focus:ring-cyan-500"
            />
            <TextInput
              placeholder="Unidad"
              name="unidad"
              value={producto.unidad}
              onChange={(e) => handleProductoChange(e, index)}
              className="text-white focus:ring-cyan-500"
            />

            {/* Campo de descripción con botón de IA */}
            <div className="flex gap-2">
              <TextInput
                placeholder="Descripción"
                name="descripcion"
                value={producto.descripcion}
                onChange={(e) => handleProductoChange(e, index)}
                className="flex-1 text-white focus:ring-cyan-500"
              />
              <AIGeneratorButton
                type="quotation"
                concept={producto.descripcion}
                onGenerated={(content) => handleAIGenerated(content, index)}
                placeholder="Ej: servicio de plomería, material eléctrico..."
                className="min-w-fit"
              />
            </div>

            <div className="flex justify-stretch">
              <TextInput
                placeholder="Precio Unitario"
                className="cols-span-1 w-3/4 text-white focus:ring-cyan-500 lg:w-full"
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
        <Button onClick={agregarProducto} className="mt-4">
          Agregar Producto
        </Button>
      </form>
    </section>
  );
}
