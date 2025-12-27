"use client";

import ContractContent from "./ContractContent";
import type { ContractData } from "@/schemas";

// Props del componente ContractPreview
interface ContractPreviewProps {
  contractData: ContractData;
  invoicesData?: unknown[]; // Tipo genérico para invoices mientras se define específicamente
}

/**
 * Componente de vista previa de contratos
 * Actúa como fachada simple que utiliza ContractContent para renderizar el contrato
 *
 * @param contractData - Datos del contrato a mostrar
 * @param invoicesData - Datos opcionales de facturas relacionadas
 */
export default function ContractPreview({
  contractData,
}: ContractPreviewProps) {
  return <ContractContent contractData={contractData} />;
}
