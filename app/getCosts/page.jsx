import GetCostForm from "@/components/GetCostForm";

export const metadata = {
  title: "Obtenedor de gastos",
  description: "Carga y procesa tus gastos desde un PDF del SAT",
};

export default function Page() {
  return (
    <section className="mt-3">
      <h1 className="text-center text-3xl font-semibold text-gray-700 underline dark:text-gray-300">
        Obtención de Información de Gastos
      </h1>
      <p className="text-center text-sm text-gray-700 dark:text-gray-300">
        Carga el archivo en PDF descargado de la página del SAT.
      </p>
      <GetCostForm />
    </section>
  );
}
