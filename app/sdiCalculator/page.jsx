"use client";

import { useState } from "react";
import { TextInput, Button, Label } from "flowbite-react";
import CurrencyInput from "react-currency-input-field";
import TablaReferenciaIDS from "@/components/TablaReferenciaIDS";

export default function Page() {
  const [salario, setSalario] = useState("");
  const [sdi, setSdi] = useState(0);
  const [vacaciones, setVacaciones] = useState(0);
  const [aguinaldo, setAguinaldo] = useState(0);

  const calculateSdi = (event) => {
    event.preventDefault(); // 🔥 Evita recargar la página

    const salarioBase = parseFloat(salario.replace(/[^0-9]/g, ""), 10);
    const diasAguinaldo = parseInt(aguinaldo);
    const diasVacaciones = parseInt(vacaciones);

    if (
      isNaN(salarioBase) ||
      isNaN(diasAguinaldo) ||
      isNaN(diasVacaciones) ||
      salarioBase <= 0 ||
      diasAguinaldo <= 0 ||
      diasVacaciones <= 0
    ) {
      alert("Por favor ingresa valores válidos");
      return;
    }

    const salarioDiario = salarioBase / 30;

    const factorVacaciones = ((diasVacaciones * 0.25) / 365).toFixed(4);
    const factorAguinaldo = (diasAguinaldo / 365).toFixed(4);
    console.log("factorVacaciones", factorVacaciones);
    console.log("factorAguinaldo", factorAguinaldo);

    // 📌 Factor de integración con valores personalizados
    const factorIntegracion =
      1 + parseFloat(factorAguinaldo) + parseFloat(factorVacaciones);

    console.log("factorIntegracion", factorIntegracion);

    const salarioDiarioIntegrado = salarioDiario * factorIntegracion;

    setSdi(salarioDiarioIntegrado.toFixed(2));
  };

  return (
    <section className="mt-10">
      <h1 className="text-center text-5xl font-black text-gray-500 dark:text-gray-300">
        Calculador SDI
      </h1>
      <p className="mt-2 text-center text-2xl font-semibold text-gray-500 dark:text-gray-300">
        &#40;Salario Diario Integrado&#41;
      </p>

      <form className="mx-auto mt-8 max-w-lg" onSubmit={calculateSdi}>
        <Label>Ingresa el salario mensual</Label>
        <div>
          <CurrencyInput
            onChange={(e) => setSalario(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700"
            intlConfig={{ locale: "es-MX", currency: "MXN" }}
          />
        </div>
        <Label>Ingresa los días de vacaciones</Label>
        <TextInput
          name="vacaciones"
          onChange={(e) => setVacaciones(e.target.value)}
        />
        <Label>Ingresa los días de Aguinaldo</Label>
        <TextInput
          name="vacaciones"
          onChange={(e) => setAguinaldo(e.target.value)}
        />
        <Button size="lg" type="submit" className="mt-4">
          Calcular
        </Button>
      </form>

      <div className="mt-5">
        {sdi > 0 && (
          <p className="text-center text-6xl font-semibold">
            El SDI es de {sdi}
          </p>
        )}
      </div>

      <div className="m-22">
        <h1 className="mt-12 text-center text-3xl font-bold text-gray-500 dark:text-gray-300">
          Tabla de referencia
        </h1>
        <div className="mx-auto max-w-5xl p-16">
          <TablaReferenciaIDS />
        </div>
      </div>
    </section>
  );
}
