import CounterMoneyTable from "@/components/CounterMoneyTable";

export default function page() {
  return (
    <section className="animate-fade">
      <h1 className="mt-5 text-center text-2xl font-semibold underline">
        Contador de Dinero
      </h1>
      <p className="text-center text-sm">
        Ingresa el número que vayas contando en su respectiva denominación.
      </p>
      <CounterMoneyTable />
    </section>
  );
}
