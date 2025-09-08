"use client";

import ContractContent from "./ContractContent";

// El componente ContractPreview ahora es una fachada simple que 
// usa ContractContent para renderizar el contrato
export default function ContractPreview({ contractData, invoicesData }) {
  return (
    <ContractContent contractData={contractData} invoicesData={invoicesData} />
  );
}
