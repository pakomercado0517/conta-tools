import ContractGeneratorForm from "@/components/ContractGeneratorForm";

export default function GeneradorContratos() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800 dark:text-gray-200">
          Generador de Contratos de Compraventa de Materiales y/o Servicios
        </h1>
        <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
          Genera contratos de compraventa de materiales y/o servicios con
          formato profesional.
        </p>
        <ContractGeneratorForm />
      </div>
    </div>
  );
}
