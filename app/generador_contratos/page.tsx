import type { Metadata } from "next";
import ContractGeneratorForm from "@/components/ContractGeneratorFormWithAI";

// Metadatos específicos para el generador de contratos
export const metadata: Metadata = {
  title: "Generador de Contratos - ContaTools",
  description:
    "Genera contratos de compraventa de materiales y/o servicios con formato profesional. Herramienta inteligente con IA para crear contratos legales.",
  keywords: [
    "generador de contratos",
    "contratos de compraventa",
    "contratos comerciales",
    "documentos legales",
    "contratos con IA",
    "formato profesional",
  ],
  openGraph: {
    title: "Generador de Contratos - ContaTools",
    description:
      "Genera contratos de compraventa de materiales y/o servicios con formato profesional.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Página del Generador de Contratos de ContaTools
 * Permite generar contratos de compraventa con formato profesional usando IA
 *
 * @param params - Parámetros de la URL
 * @param searchParams - Parámetros de búsqueda de la URL
 */
export default async function GeneradorContratosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-gray-200">
            Generador de Contratos de Compraventa de Materiales y/o Servicios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Genera contratos de compraventa de materiales y/o servicios con
            formato profesional usando inteligencia artificial.
          </p>
        </header>

        <main>
          <ContractGeneratorForm />
        </main>
      </div>
    </div>
  );
}
