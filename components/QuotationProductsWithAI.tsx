"use client";
import { TextInput, Button, Label, Textarea } from "flowbite-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { ChangeEvent } from "react";
import AIGeneratorButton from "@/components/AIGeneratorButton";
import useFormatNumber from "@/hooks/useFormatNumber";
import { lineAmount } from "@/lib/quotationTotals";
import type {
  QuotationFormData,
  QuotationProductChangeHandler,
  QuotationTaxLine,
  QuotationTaxModo,
  QuotationTaxTipo,
} from "@/types/quotation";

const selectClass =
  "block w-full rounded-lg border border-gray-600 bg-gray-800 p-2.5 text-sm text-white focus:border-cyan-500 focus:ring-cyan-500";

interface QuotationProductsWithAIProps {
  datos: QuotationFormData;
  handleProductoChange: QuotationProductChangeHandler;
  agregarProducto: () => void;
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
 * Partidas de la cotización, con redacción asistida y conceptos fiscales por línea.
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
  const formatNumber = useFormatNumber();

  const handleAIGenerated = (generatedContent: string, index: number): void => {
    const syntheticEvent = {
      target: {
        name: "descripcion",
        value: generatedContent,
      },
    } as ChangeEvent<HTMLInputElement>;

    handleProductoChange(syntheticEvent, index);
  };

  return (
    <section className="my-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
      <h2 className="text-xl font-semibold text-gray-200">3. Partidas</h2>
      <p className="mb-5 mt-1 text-sm text-gray-400">
        Tabla del documento. El precio vacío no suma al total.
      </p>

      {datos.productos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-600 px-4 py-8 text-center">
          <p className="mb-4 text-sm text-gray-400">
            Aún no hay partidas. Agrega cada concepto con su cantidad y precio.
          </p>
          <Button type="button" onClick={agregarProducto}>
            Agregar partida
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {datos.productos.map((producto, index) => {
            const importe = lineAmount(producto);
            const impuestos = producto.impuestosLinea ?? [];

            return (
              <div
                key={index}
                className="rounded-lg border border-gray-700 p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-gray-200">
                    Partida {index + 1}
                  </h3>
                  <Button
                    color="failure"
                    size="sm"
                    type="button"
                    className="flex h-9 w-9 items-center justify-center"
                    onClick={() => eliminarProducto(index)}
                    aria-label={`Eliminar partida ${index + 1}`}
                  >
                    <RiDeleteBin6Line className="text-lg" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1 block text-sm font-medium text-gray-300">
                      Cantidad
                    </Label>
                    <TextInput
                      placeholder="1"
                      name="cantidad"
                      value={producto.cantidad}
                      onChange={(e) => handleProductoChange(e, index)}
                      className="text-white focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block text-sm font-medium text-gray-300">
                      Unidad
                    </Label>
                    <TextInput
                      placeholder="pza, m, servicio"
                      name="unidad"
                      value={producto.unidad}
                      onChange={(e) => handleProductoChange(e, index)}
                      className="text-white focus:ring-cyan-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1 block text-sm font-medium text-gray-300">
                      Precio unitario
                    </Label>
                    <TextInput
                      placeholder="Vacío = sin importe"
                      name="precioUnitario"
                      value={producto.precioUnitario}
                      onChange={(e) => handleProductoChange(e, index)}
                      className="text-white focus:ring-cyan-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Vacío: la partida sale sin importe y no suma al total.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="mb-1 block text-sm font-medium text-gray-300">
                      Descripción
                    </Label>
                    <div className="flex flex-col gap-2">
                      <Textarea
                        placeholder="Concepto"
                        name="descripcion"
                        value={producto.descripcion}
                        rows={2}
                        onChange={(e) => handleProductoChange(e, index)}
                        className="flex-1 text-white focus:ring-cyan-500"
                      />
                      <AIGeneratorButton
                        type="quotation"
                        concept={producto.descripcion}
                        onGenerated={(content) =>
                          handleAIGenerated(content, index)
                        }
                        placeholder="Ej: servicio de plomería, material eléctrico..."
                        label="Redactar concepto"
                        className="min-w-fit"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="mb-1 block text-sm font-medium text-gray-300">
                      Importe
                    </Label>
                    <p className="flex h-10 items-center text-sm font-medium text-gray-100">
                      {importe === null ? "Sin importe" : formatNumber.format(importe)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {impuestos.length === 0 ? (
                    <Button
                      size="xs"
                      color="gray"
                      type="button"
                      onClick={() => agregarImpuestoProducto(index)}
                    >
                      Agregar IVA o retención
                    </Button>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-600 bg-gray-900/30 p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-300">
                          Impuestos y retenciones de esta partida
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
                        El porcentaje se calcula sobre el importe de esta
                        partida. La retención resta del total.
                      </p>
                      {impuestos.map((tax, ti) => (
                        <div
                          key={ti}
                          className="mb-3 grid grid-cols-1 gap-2 rounded-md border border-gray-700/80 p-3 sm:grid-cols-2"
                        >
                          <div>
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
                          <div>
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
                              <option value="impuesto">
                                Impuesto (suma al total)
                              </option>
                              <option value="retencion">
                                Retención (resta del total)
                              </option>
                            </select>
                          </div>
                          <div>
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
                          <div>
                            <Label className="mb-1 block text-xs text-gray-400">
                              Valor
                            </Label>
                            <TextInput
                              placeholder={
                                tax.modo === "porcentaje" ? "Ej: 16" : "Ej: 500"
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
                          <div className="flex justify-end sm:col-span-2">
                            <Button
                              size="xs"
                              color="failure"
                              type="button"
                              onClick={() =>
                                eliminarImpuestoProducto(index, ti)
                              }
                            >
                              Quitar concepto
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <Button type="button" onClick={agregarProducto}>
            Agregar partida
          </Button>
        </div>
      )}
    </section>
  );
}
