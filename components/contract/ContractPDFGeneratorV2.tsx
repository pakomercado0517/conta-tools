"use client";

import { useState } from "react";
import { Button } from "flowbite-react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import {
  buildContractPdfFileName,
  generateContractPdf,
} from "@/lib/contract/pdf/engine";
import { ContractGenerated, ContractInput } from "@/types/contract-v2";

interface ContractPDFGeneratorV2Props {
  contract: ContractGenerated;
  input: ContractInput;
  children?: React.ReactNode;
  className?: string;
  fileName?: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export default function ContractPDFGeneratorV2({
  contract,
  input,
  children,
  className = "",
  fileName,
  onSuccess,
  onError,
}: ContractPDFGeneratorV2Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const doc = await generateContractPdf(contract, input);
      doc.save(fileName || buildContractPdfFileName(contract, input));
      onSuccess?.();
    } catch (error) {
      console.error("Error generando PDF:", error);
      const message = "Error al generar el PDF. Intenta de nuevo.";
      if (onError) {
        onError(message);
      } else {
        alert(message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const buttonClassName =
    className ||
    "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 text-white border-0";

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      className={buttonClassName}
    >
      {isGenerating ? (
        <span className="flex items-center gap-2">
          <FaSpinner className="animate-spin" />
          <span className="hidden sm:inline">Generando PDF...</span>
          <span className="sm:hidden">PDF...</span>
        </span>
      ) : children ? (
        children
      ) : (
        <>
          <FaFilePdf className="mr-2" />
          Descargar PDF
        </>
      )}
    </Button>
  );
}
