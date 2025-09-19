import PaybackForm from "@/components/PaybackForm";
import type { Metadata } from 'next';

// Metadatos de la página
export const metadata: Metadata = {
  title: "Registro de devolución",
  description: "Calcula el monto a devolver con información detallada del payback"
};

/**
 * Página de información de payback/devolución
 * Permite calcular montos de devolución usando el componente PaybackForm
 */
export default function PaybackInformationPage() {
  return (
    <section className="mt-8">
      <h1 className="mb-3 text-center text-3xl font-semibold text-gray-700 dark:text-gray-300">
        Obtener monto a devolver
      </h1>
      <article className="mx-auto max-w-5xl">
        <PaybackForm />
      </article>
    </section>
  );
}
