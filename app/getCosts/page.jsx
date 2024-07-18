import GetCostForm from "@/components/GetCostForm";
export default function Page() {
  return (
    <section className="mt-3 animate-fade">
      <h1 className="text-center text-3xl font-semibold underline">
        Obtención de Información de Gastos
      </h1>
      <p className="text-center text-sm">
        Carga el archivo en PDF descargado de la página del SAT.
      </p>
      <GetCostForm />
    </section>
  );
}
