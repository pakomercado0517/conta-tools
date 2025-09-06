import ContractGeneratorForm from "@/components/ContractGeneratorForm";

export default function GeneradorContratos() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8 text-center">
          Generador de Contratos de Prestación de Servicios
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
          Carga tus facturas PDF y genera automáticamente un contrato de prestación de servicios profesionales.
        </p>
        <ContractGeneratorForm />
      </div>
    </div>
  );
}
