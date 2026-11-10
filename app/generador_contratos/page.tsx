import type { Metadata } from "next";
import ContractWizard from "@/components/contract/ContractWizard";

// Force dynamic rendering to avoid SSR issues with localStorage
export const dynamic = "force-dynamic";

// Metadatos específicos para el generador de contratos
export const metadata: Metadata = {
  title: "Generador de Contratos con IA - ContaTools",
  description:
    "Genera contratos completos y válidos legalmente en México (compraventa, arrendamiento, servicios, obra, mandato) usando IA. Solo ingresas los datos esenciales y la IA redacta todo el contrato.",
  keywords: [
    "generador de contratos",
    "contratos con IA",
    "contrato compraventa",
    "contrato arrendamiento",
    "contrato servicios",
    "contrato obra",
    "contrato mandato",
    "documentos legales México",
    "abogado IA",
  ],
  openGraph: {
    title: "Generador de Contratos con IA - ContaTools",
    description:
      "Genera contratos completos y válidos legalmente en México usando IA. Solo ingresas los datos esenciales.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Página del Generador de Contratos de ContaTools v2
 * Wizard de 5 pasos + IA generando contrato completo
 */
export default async function GeneradorContratosPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ContractWizard />
    </div>
  );
}