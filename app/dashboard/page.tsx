import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

// Metadatos específicos para el dashboard
export const metadata: Metadata = {
  title: "Dashboard - ContaTools",
  description:
    "Panel de control de ContaTools. Accede a todas las herramientas contables desde un solo lugar.",
  keywords: [
    "dashboard",
    "panel de control",
    "herramientas contables",
    "gestión financiera",
  ],
  robots: {
    index: false, // Dashboard no debería ser indexado por buscadores
    follow: false,
  },
};

/**
 * Página del Dashboard principal de ContaTools
 * Actualmente muestra un componente "Coming Soon" hasta que se implemente la funcionalidad completa
 *
 * @param params - Parámetros de la URL
 * @param searchParams - Parámetros de búsqueda de la URL
 */
export default async function DashboardPage() {
  return <ComingSoon variant="dashboard" />;
}
