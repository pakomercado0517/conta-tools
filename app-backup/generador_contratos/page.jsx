import ContractGeneratorForm from "@/components/ContractGeneratorForm";

export default function GeneradorContratos() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8 text-center">
          Generador de Contratos de Compraventa de Materiales y/o Servicios
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
          Genera contratos de compraventa de materiales y/o servicios con formato profesional.
        </p>
        <ContractGeneratorForm />
      </div>
    </div>
  );
}
