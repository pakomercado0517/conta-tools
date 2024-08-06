"use client";

import { Label, TextInput, Textarea } from "flowbite-react";

export default function QuotationForm({ handleChange, datos }) {
  return (
    <section className="px-3 lg:px-0">
      <h1 className="my-6 text-center text-2xl font-bold underline">
        Generador de cotizaciones.{" "}
      </h1>
      <h2 className="my-4 text-center text-xl font-semibold">
        Información del Remitente
      </h2>
      <form className="mb-5 grid grid-cols-2 gap-5 md:grid-cols-3">
        <div>
          <Label className="text-white">Nombre de la Empresa</Label>
          <TextInput id="empresa" name="empresa" onChange={handleChange} />
        </div>
        <div>
          <Label className="text-white">RFC</Label>
          <TextInput
            id="rfc"
            name="rfc"
            onChange={handleChange}
            value={datos.rfc.toUpperCase()}
          />
        </div>
        <div>
          <Label className="text-white">Teléfono</Label>
          <TextInput
            id="telefono"
            name="telefono"
            type="number"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label className="text-white">Email</Label>
          <TextInput id="email" name="email" onChange={handleChange} />
        </div>
        <div>
          <Label className="text-white">Nombre del Representante</Label>
          <TextInput
            id="firma"
            name="firma"
            placeholder="Persona que firma"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label className="text-white">Puesto</Label>
          <TextInput id="cargo" name="cargo" onChange={handleChange} />
        </div>
        <div>
          <Label className="text-white">Fecha</Label>
          <TextInput
            id="fecha"
            name="fecha"
            type="date"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Domicilio</Label>
          <Textarea id="domicilio" name="domicilio" onChange={handleChange} />
        </div>
      </form>
    </section>
  );
}
