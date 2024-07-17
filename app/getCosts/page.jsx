import GetCostForm from "@/components/GetCostForm";
export default function Page() {
  return (
    <section className="mt-3">
      <h1 className="text-center text-3xl font-semibold underline">
        Obtención de Información de Gastos
      </h1>
      <p className="text-center text-sm">
        Captura el RFC y monto de los gastos buscados, al dar en agregar se ira
        creando la lista
      </p>
      <GetCostForm />
    </section>
  );
}
