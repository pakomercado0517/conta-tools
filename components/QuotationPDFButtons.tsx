"use client";

import { Button, FileInput, Label, TextInput } from "flowbite-react";
import { FaMedal, FaUser } from "react-icons/fa";
import type { QuotationPDFButtonsProps } from "@/types/quotation";

/**
 * Firma, nombre y puesto, más las acciones para ver o descargar el PDF.
 */
export default function QuotationPDFButtons({
  datos,
  firmaImg,
  onFirmaChange,
  onPreview,
  onDownload,
  handleChange,
}: QuotationPDFButtonsProps) {
  return (
    <>
      <section className="my-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
        <h2 className="text-lg font-semibold text-gray-200">Firma</h2>
        <p className="mb-5 mt-1 text-sm text-gray-400">
          Nombre, puesto e imagen, al pie del documento junto a «Atentamente».
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="firma"
              className="mb-1 text-sm font-medium text-gray-300"
            >
              Nombre del representante
            </Label>
            <TextInput
              id="firma"
              name="firma"
              icon={FaUser}
              placeholder="Persona que firma"
              onChange={handleChange}
              value={datos.firma}
              className="text-white focus:ring-cyan-500"
            />
          </div>
          <div>
            <Label
              htmlFor="cargo"
              className="mb-1 text-sm font-medium text-gray-300"
            >
              Puesto
            </Label>
            <TextInput
              id="cargo"
              icon={FaMedal}
              name="cargo"
              onChange={handleChange}
              value={datos.cargo}
              className="text-white focus:ring-cyan-500"
              placeholder="Puesto del representante"
            />
          </div>
          <div className="sm:col-span-2">
            <Label
              htmlFor="firmaImg"
              className="mb-1 text-sm font-medium text-gray-300"
            >
              Imagen de la firma
            </Label>
            <FileInput
              id="firmaImg"
              name="firmaImg"
              onChange={onFirmaChange}
              accept="image/*"
              color="dark"
              helperText={
                firmaImg
                  ? "Firma cargada. Se incluye en la vista previa y en el PDF."
                  : "Opcional. PNG o imagen de la firma."
              }
              className="text-white focus:ring-cyan-500"
            />
          </div>
        </div>
      </section>

      <div className="mt-2 grid grid-cols-2 gap-4 pb-6">
        <Button
          color="gray"
          size="xl"
          outline
          onClick={onPreview}
          type="button"
        >
          Previsualizar
        </Button>
        <Button color="cyan" size="xl" onClick={onDownload} type="button">
          Descargar PDF
        </Button>
      </div>
    </>
  );
}
