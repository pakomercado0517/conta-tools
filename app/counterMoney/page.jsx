import CounterMoneyTable from "@/components/CounterMoneyTable";

export default function page() {
  return (
    <section className="">
      <h1 className="mt-5 text-center text-2xl font-semibold text-gray-700 underline dark:text-gray-300">
        Contador de Dinero
      </h1>
      <p className="text-center text-sm text-gray-700 dark:text-gray-300">
        Ingresa el número que vayas contando en su respectiva denominación.
      </p>
      <CounterMoneyTable />
    </section>
  );
}
