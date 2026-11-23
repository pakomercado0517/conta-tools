import type { ContractGenerated, ContractInput } from "@/types/contract-v2";
import {
  cleanClauseTitle,
  indexLetter,
  prepareDeclarationItems,
} from "@/lib/contract/numbering";
import { sanitizeContractText, sanitizeMultilineBody } from "./sanitize";

export type SignaturePartyBlock = {
  titulo: string;
  nombre: string;
  representante?: string;
  imagen?: string;
  texto?: string;
};

export type PreparedContractDocument = {
  titulo: string;
  preambulo: string;
  declaracionesEncabezado: string;
  declaracionParteA: {
    encabezado: string;
    items: string[];
  };
  declaracionParteB: {
    encabezado: string;
    items: string[];
  };
  transicion: string;
  clausulasEncabezado: string;
  clausulas: Array<{
    numeroRomano: string;
    titulo: string;
    contenido: string;
  }>;
  leyendaFirma: string;
  /** Izquierda = Parte B (cliente), derecha = Parte A (prestador) — convención contractual */
  firmaIzquierda: SignaturePartyBlock;
  firmaDerecha: SignaturePartyBlock;
};

function buildPreambulo(contract: ContractGenerated, input: ContractInput): string {
  const repA =
    input.parteA.esEmpresa && input.parteA.representante
      ? `, representado por ${input.parteA.representante}`
      : "";
  const repB =
    input.parteB.esEmpresa && input.parteB.representante
      ? `, representado por ${input.parteB.representante}`
      : "";

  return sanitizeMultilineBody(
    `En ${contract.firma.ciudad}, a ${contract.firma.fechaEnLetras}, se celebra el presente ${contract.titulo} entre ${contract.terminologia.parteA}, ${input.parteA.nombre}${repA}, con domicilio en ${input.parteA.domicilio}, y ${contract.terminologia.parteB}, ${input.parteB.nombre}${repB}, con domicilio en ${input.parteB.domicilio}, a quienes en lo sucesivo se les denominará conjunta e indistintamente como "LAS PARTES", al tenor de las siguientes declaraciones y cláusulas:`
  );
}

function formatDeclarationItems(items: string[]): string[] {
  return prepareDeclarationItems(items).map((item, i) => {
    const clean = sanitizeContractText(item, { softenCaps: true });
    return `${indexLetter(i)}. ${clean}`;
  });
}

/**
 * Prepara y sanitiza el contrato para el motor de maquetación PDF.
 */
export function prepareContractDocument(
  contract: ContractGenerated,
  input: ContractInput
): PreparedContractDocument {
  const titulo = sanitizeContractText(contract.titulo, { softenCaps: false }).toUpperCase();

  const encabezadoA = sanitizeContractText(
    `I. DECLARA ${contract.terminologia.parteA}${
      input.parteA.esEmpresa ? " POR CONDUCTO DE SU REPRESENTANTE LEGAL" : ""
    }:`,
    { softenCaps: false }
  );

  const encabezadoB = sanitizeContractText(
    `II. DECLARA ${contract.terminologia.parteB}${
      input.parteB.esEmpresa ? " POR CONDUCTO DE SU REPRESENTANTE LEGAL" : ""
    }:`,
    { softenCaps: false }
  );

  return {
    titulo,
    preambulo: buildPreambulo(contract, input),
    declaracionesEncabezado: "DECLARACIONES",
    declaracionParteA: {
      encabezado: encabezadoA,
      items: formatDeclarationItems(contract.declaraciones.parteA),
    },
    declaracionParteB: {
      encabezado: encabezadoB,
      items: formatDeclarationItems(contract.declaraciones.parteB),
    },
    transicion: sanitizeMultilineBody(
      "De conformidad con las declaraciones anteriores, las Partes convienen en otorgar las siguientes:"
    ),
    clausulasEncabezado: "CLÁUSULAS",
    clausulas: contract.clausulas.map((c) => ({
      numeroRomano: c.numeroRomano.trim().toUpperCase(),
      titulo: sanitizeContractText(cleanClauseTitle(c.numeroRomano, c.titulo), {
        softenCaps: false,
      }).toUpperCase(),
      contenido: sanitizeMultilineBody(c.contenido),
    })),
    leyendaFirma: sanitizeMultilineBody(contract.firma.leyendaCompleta),
    firmaIzquierda: {
      titulo: contract.terminologia.parteB,
      nombre: input.parteB.nombre,
      representante: input.parteB.representante,
      imagen: input.firmas.imagenB,
      texto: input.firmas.textoFirmaB,
    },
    firmaDerecha: {
      titulo: contract.terminologia.parteA,
      nombre: input.parteA.nombre,
      representante: input.parteA.representante,
      imagen: input.firmas.imagenA,
      texto: input.firmas.textoFirmaA,
    },
  };
}
