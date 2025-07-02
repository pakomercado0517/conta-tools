import PaybackForm from "@/components/PaybackForm";

export default function Page() {
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
