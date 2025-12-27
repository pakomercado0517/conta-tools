"use client";

import { Label, TextInput, Textarea, FileInput } from "flowbite-react";
import { LuFactory } from "react-icons/lu";
import {
  FaAddressCard,
  FaMedal,
  FaPhoneSquareAlt,
  FaUser,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import type { QuotationFormProps } from "@/types/quotation";

/**
 * Componente formulario para información del remitente en cotizaciones
 * Captura datos básicos de la empresa y representante
 *
 * @param handleChange - Función para manejar cambios en inputs
 * @param datos - Datos actuales del formulario
 * @param agregarLogoEmpresa - Función para manejar carga de logo
 */
export default function QuotationForm({
  handleChange,
  datos,
  agregarLogoEmpresa,
}: QuotationFormProps) {
  return (
    <section className="px-3 lg:px-0">
      <h1 className="mb-4 text-center text-4xl font-extrabold tracking-tight text-gray-700 dark:text-white">
        Generador de Cotizaciones
      </h1>
      <h2 className="mb-1 text-center text-xl font-semibold text-gray-700 dark:text-gray-300">
        Información del Remitente
      </h2>
      <p className="mb-6 text-center text-sm italic text-gray-500 dark:text-gray-400">
        (Esta información aparecerá en el encabezado del documento)
      </p>

      <div className="rounded-xl bg-gray-900/60 p-6 shadow-md">
        <form className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {/* Nombre de la Empresa */}
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

          {/* RFC */}
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

          {/* Teléfono */}
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
              value={String(datos.telefono)}
              className="text-white focus:ring-cyan-500"
              placeholder="Teléfono de contacto"
            />
          </div>

          {/* Email */}
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

          {/* Nombre del Representante */}
          <div>
            <Label
              htmlFor="firma"
              className="mb-1 text-sm font-medium text-gray-300"
            >
              Nombre del Representante
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

          {/* Puesto */}
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

          {/* Fecha */}
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

          {/* Lugar de Remisión */}
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

          {/* Domicilio */}
          <div>
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

          {/* Logotipo (ocupa 2 columnas en md+) */}
          <div className="md:col-span-2">
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
              helperText="Si tienes el logo de tu empresa cárgalo aquí para que aparezca en el encabezado"
              className="text-white focus:ring-cyan-500"
              accept="image/*"
            />
          </div>
        </form>
      </div>
    </section>
  );
}
