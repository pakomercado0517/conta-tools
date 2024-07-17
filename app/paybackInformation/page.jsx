import PaybackForm from "@/components/PaybackForm";

export default function Page() {
  return (
    <section className="animate-fade mt-8">
      <h1 className="text-center text-3xl font-semibold underline">
        Obtener monto a devolver
      </h1>
      <article className="mx-auto max-w-5xl">
        <PaybackForm />
      </article>
    </section>
  );
}
