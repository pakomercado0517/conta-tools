import type { Metadata } from "next";
import QuotationLayout from "@/components/QuotationLayout";
import type { QuotationPageProps } from "@/types/pages";

// Metadatos específicos para el generador de cotizaciones
export const metadata: Metadata = {
  title: "Generador de Cotizaciones - ContaTools",
  description: "Genera cotizaciones profesionales con formato empresarial. Incluye productos, servicios, cláusulas y datos bancarios.",
  keywords: [
    "generador de cotizaciones",
    "cotizaciones profesionales",
    "presupuestos",
    "facturación",
    "propuestas comerciales",
    "PDF cotizaciones"
  ],
  openGraph: {
    title: "Generador de Cotizaciones - ContaTools",
    description: "Genera cotizaciones profesionales con formato empresarial.",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

/**
 * Página del Generador de Cotizaciones de ContaTools
 * Permite crear cotizaciones profesionales con productos, servicios y datos empresariales
 * 
 * @param params - Parámetros de la URL
 * @param searchParams - Parámetros de búsqueda de la URL
 */
export default async function QuotationPage(_props: QuotationPageProps) {
  return <QuotationLayout />;
}