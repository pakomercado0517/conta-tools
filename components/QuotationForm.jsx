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

export default function QuotationForm({
  handleChange,
  datos,
  agregarLogoEmpresa,
}) {
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
        <form className="mb-5 grid grid-cols-2 gap-5 md:grid-cols-3">
          <div>
            <Label className="mb-1 text-sm font-medium text-gray-300">
              Nombre de la Empresa
            </Label>
            <TextInput
              id="empresa"
              icon={LuFactory}
              name="empresa"
              onChange={handleChange}
              className="text-white focus:ring-cyan-500"
            />
          </div>
          <div>
            <Label className="mb-1 text-sm font-medium text-gray-300">
              RFC
            </Label>
            <TextInput
              id="rfc"
              name="rfc"
              icon={FaAddressCard}
              onChange={handleChange}
              value={datos.rfc.toUpperCase()}
              className="text-white focus:ring-cyan-500"
            />
          </div>
          <div>
            <Label className="mb-1 text-sm font-medium text-gray-300">
              Teléfono
            </Label>
            <TextInput
              id="telefono"
              name="telefono"
              icon={FaPhoneSquareAlt}
              type="number"
              onChange={handleChange}
              className="text-white focus:ring-cyan-500"
            />
          </div>
          <div>
            <Label className="mb-1 text-sm font-medium text-gray-300">
              Email
            </Label>
            <TextInput
              id="email"
              icon={MdEmail}
              name="email"
              onChange={handleChange}
              className="text-white focus:ring-cyan-500"
            />
          </div>
          <div>
            <Label className="mb-1 text-sm font-medium text-gray-300">
              Nombre del Representante
            </Label>
            <TextInput
              id="firma"
              name="firma"
              icon={FaUser}
              placeholder="Persona que firma"
              onChange={handleChange}
              className="text-white focus:ring-cyan-500"
            />
          </div>
          <div>
            <Label className="mb-1 text-sm font-medium text-gray-300">
              Puesto
            </Label>
            <TextInput
              id="cargo"
              icon={FaMedal}
              name="cargo"
              onChange={handleChange}
              className="text-white focus:ring-cyan-500"
            />
          </div>
          <div>
            <Label className="mb-1 text-sm font-medium text-gray-300">
              Fecha
            </Label>
            <TextInput
              id="fecha"
              name="fecha"
              type="date"
              onChange={handleChange}
              className="text-white focus:ring-cyan-500"
            />
          </div>
          <div>
            <Label className="mb-1 text-sm font-medium text-gray-300">
              Domicilio
            </Label>
            <Textarea
              id="domicilio"
              name="domicilio"
              onChange={handleChange}
              className="text-white focus:ring-cyan-500"
            />
          </div>
          <div>
            <Label className="mb-1 text-sm font-medium text-gray-300">
              Logotipo de la Empresa
            </Label>
            <FileInput
              id="logoCompany"
              name="logoCompany"
              color="dark"
              onChange={agregarLogoEmpresa}
              helperText="Si tienes el logo de tu empresa cargalo aquí para que aparezca en el encabezado"
              className="text-white focus:ring-cyan-500"
            />
          </div>
        </form>
      </div>
    </section>
  );
}
