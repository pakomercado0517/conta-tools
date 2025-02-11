"use client";

import { useState } from "react";
import { TextInput, Button, Label } from "flowbite-react";
import CurrencyInput from "react-currency-input-field";

export default function Page() {
  const [salario, setSalario] = useState("");
  const [sdi, setSdi] = useState(0);

  const calculateSdi = (event) => {
    event.preventDefault(); // 🔥 Previene la recarga del formulario

    const salarioBase = parseFloat(salario.replace(/[^0-9]/g, ""), 10);

    if (isNaN(salarioBase) || salarioBase <= 0) {
      alert("Por favor ingresa un número válido");
      return;
    }

    const salarioDiario = salarioBase / 30;
    const factorIntegracion = 1 + 15 / 365 + (6 * 0.25) / 365;
    const salarioDiarioIntegrado = salarioDiario * factorIntegracion;

    setSdi(salarioDiarioIntegrado.toFixed(2));
  };

  return (
    <section className="mt-10">
      <h1 className="text-center text-5xl font-black">Calculador SDI</h1>
      <p className="mt-2 text-center text-2xl font-semibold">
        &#40;Salario Diario Integrado&#41;
      </p>

      <form className="mx-auto mt-8 max-w-lg" onSubmit={calculateSdi}>
        <Label>Ingresa el salario mensual</Label>
        <div>
          <CurrencyInput
            onChange={(e) => setSalario(e.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-500"
            intlConfig={{ locale: "es-MX", currency: "MXN" }}
          />
        </div>
        <Button type="submit" className="mt-4">
          Calcular
        </Button>
      </form>

      <div className="mt-5">
        <p className="text-center text-xl">El SDI es de {sdi}</p>
      </div>
    </section>
  );
}
