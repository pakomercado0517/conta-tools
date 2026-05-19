"use client";
import { TextInput, Button, Label } from "flowbite-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { ChangeEvent, MouseEvent } from "react";
import AIGeneratorButton from "@/components/AIGeneratorButton";
import type {
  QuotationFormData,
  QuotationProductChangeHandler,
  QuotationTaxLine,
  QuotationTaxModo,
  QuotationTaxTipo,
} from "@/types/quotation";

const selectClass =
  "block w-full rounded-lg border border-gray-600 bg-gray-800 p-2.5 text-sm text-white focus:border-cyan-500 focus:ring-cyan-500";

// Tipos para las props del componente
interface QuotationProductsWithAIProps {
  datos: QuotationFormData;
  handleProductoChange: QuotationProductChangeHandler;
  agregarProducto: (e: MouseEvent<HTMLButtonElement>) => void;
  eliminarProducto: (index: number) => void;
  agregarImpuestoProducto: (productIndex: number) => void;
  eliminarImpuestoProducto: (productIndex: number, taxIndex: number) => void;
  handleImpuestoProductoChange: (
    productIndex: number,
    taxIndex: number,
    field: keyof QuotationTaxLine,
    value: string
  ) => void;
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
  agregarImpuestoProducto,
  eliminarImpuestoProducto,
  handleImpuestoProductoChange,
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
            <div className="flex gap-2 md:col-span-2">
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

            <div className="flex justify-stretch md:col-span-2">
              <TextInput
                placeholder="Precio unitario (vacío = sin importe en PDF)"
                className="w-full flex-1 text-white focus:ring-cyan-500"
                name="precioUnitario"
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

            <div className="col-span-1 rounded-lg border border-gray-700 bg-gray-800/40 p-4 md:col-span-2">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-300">
                  Impuestos / retenciones de esta línea (opcional)
                </span>
                <Button
                  size="xs"
                  color="gray"
                  type="button"
                  onClick={() => agregarImpuestoProducto(index)}
                >
                  Agregar concepto
                </Button>
              </div>
              <p className="mb-3 text-xs text-gray-500">
                Base: importe de la línea (cantidad × precio) cuando el precio es
                mayor a cero. Las retenciones se muestran en positivo en el PDF y
                restan del total.
              </p>
              {(producto.impuestosLinea ?? []).map((tax, ti) => (
                <div
                  key={ti}
                  className="mb-3 grid grid-cols-1 gap-2 rounded-md border border-gray-700/80 p-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end"
                >
                  <div className="lg:col-span-4">
                    <Label className="mb-1 block text-xs text-gray-400">
                      Etiqueta (PDF)
                    </Label>
                    <TextInput
                      placeholder="Ej: IVA, ISR…"
                      value={tax.etiqueta}
                      onChange={(e) =>
                        handleImpuestoProductoChange(
                          index,
                          ti,
                          "etiqueta",
                          e.target.value
                        )
                      }
                      className="text-white focus:ring-cyan-500"
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <Label className="mb-1 block text-xs text-gray-400">
                      Tipo
                    </Label>
                    <select
                      className={selectClass}
                      value={tax.tipo}
                      onChange={(e) =>
                        handleImpuestoProductoChange(
                          index,
                          ti,
                          "tipo",
                          e.target.value as QuotationTaxTipo
                        )
                      }
                    >
                      <option value="impuesto">Impuesto (suma al total)</option>
                      <option value="retencion">
                        Retención (resta del total)
                      </option>
                    </select>
                  </div>
                  <div className="lg:col-span-3">
                    <Label className="mb-1 block text-xs text-gray-400">
                      Base de cálculo
                    </Label>
                    <select
                      className={selectClass}
                      value={tax.modo}
                      onChange={(e) =>
                        handleImpuestoProductoChange(
                          index,
                          ti,
                          "modo",
                          e.target.value as QuotationTaxModo
                        )
                      }
                    >
                      <option value="porcentaje">Porcentaje (%)</option>
                      <option value="cuota_fija">Cuota fija ($)</option>
                    </select>
                  </div>
                  <div className="lg:col-span-2">
                    <Label className="mb-1 block text-xs text-gray-400">
                      Valor
                    </Label>
                    <TextInput
                      placeholder={
                        tax.modo === "porcentaje"
                          ? "Ej: 16"
                          : "Ej: 500"
                      }
                      value={tax.valor}
                      onChange={(e) =>
                        handleImpuestoProductoChange(
                          index,
                          ti,
                          "valor",
                          e.target.value
                        )
                      }
                      className="text-white focus:ring-cyan-500"
                    />
                  </div>
                  <div className="flex justify-end lg:col-span-12">
                    <Button
                      size="xs"
                      color="failure"
                      type="button"
                      onClick={() => eliminarImpuestoProducto(index, ti)}
                    >
                      Quitar concepto
                    </Button>
                  </div>
                </div>
              ))}
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
