"use client";

import { Label, TextInput, Textarea, FileInput } from "flowbite-react";
import { LuFactory } from "react-icons/lu";
import { FaAddressCard, FaPhoneSquareAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import type { QuotationFormProps } from "@/types/quotation";

/**
 * Encabezado de la cotización: empresa, contacto, fecha y logo.
 */
export default function QuotationForm({
  handleChange,
  datos,
  agregarLogoEmpresa,
}: QuotationFormProps) {
  return (
    <section className="rounded-xl bg-gray-900/60 p-6 shadow-md">
      <h2 className="text-xl font-semibold text-gray-200">1. Encabezado</h2>
      <p className="mb-6 mt-1 text-sm text-gray-400">
        Logo, empresa y fecha, arriba del documento.
      </p>

      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label
            htmlFor="empresa"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            Nombre de la Empresa
          </Label>
          <TextInput
            id="empresa"
            icon={LuFactory}
            name="empresa"
            onChange={handleChange}
            value={datos.empresa}
            className="text-white focus:ring-cyan-500"
            placeholder="Nombre de tu empresa"
          />
        </div>

        <div>
          <Label
            htmlFor="rfc"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            RFC
          </Label>
          <TextInput
            id="rfc"
            name="rfc"
            icon={FaAddressCard}
            onChange={handleChange}
            value={String(datos.rfc).toUpperCase()}
            className="text-white focus:ring-cyan-500"
            placeholder="RFC de la empresa"
            maxLength={13}
          />
        </div>

        <div>
          <Label
            htmlFor="telefono"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            Teléfono
          </Label>
          <TextInput
            id="telefono"
            name="telefono"
            icon={FaPhoneSquareAlt}
            type="tel"
            onChange={handleChange}
              value={datos.telefono === 0 ? "" : String(datos.telefono)}
            className="text-white focus:ring-cyan-500"
            placeholder="Teléfono de contacto"
          />
        </div>

        <div>
          <Label
            htmlFor="email"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            Email
          </Label>
          <TextInput
            id="email"
            icon={MdEmail}
            name="email"
            type="email"
            onChange={handleChange}
            value={datos.email}
            className="text-white focus:ring-cyan-500"
            placeholder="correo@empresa.com"
          />
        </div>

        <div>
          <Label
            htmlFor="fecha"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            Fecha
          </Label>
          <TextInput
            id="fecha"
            name="fecha"
            type="date"
            onChange={handleChange}
            value={datos.fecha}
            className="text-white focus:ring-cyan-500"
          />
        </div>

        <div>
          <Label
            htmlFor="lugar"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            Lugar de Remisión
          </Label>
          <TextInput
            id="lugar"
            name="lugar"
            placeholder="Ciudad, Estado"
            onChange={handleChange}
            value={datos.lugar}
            className="text-white focus:ring-cyan-500"
          />
        </div>

        <p className="text-xs text-gray-500 sm:col-span-2">
          Forman la línea de fecha: Lugar. A día de mes del año.
        </p>

        <div className="sm:col-span-2">
          <Label
            htmlFor="domicilio"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            Domicilio
          </Label>
          <Textarea
            id="domicilio"
            name="domicilio"
            onChange={handleChange}
            value={datos.domicilio}
            className="text-white focus:ring-cyan-500"
            placeholder="Dirección completa de la empresa"
            rows={3}
          />
        </div>

        <div className="sm:col-span-2">
          <Label
            htmlFor="logoCompany"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            Logotipo de la Empresa
          </Label>
          <FileInput
            id="logoCompany"
            name="logoCompany"
            color="dark"
            onChange={agregarLogoEmpresa}
            helperText="Opcional. Si lo cargas, aparece en el encabezado."
            className="text-white focus:ring-cyan-500"
            accept="image/*"
          />
        </div>
      </form>
    </section>
  );
}
