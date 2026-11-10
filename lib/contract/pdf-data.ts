import { ContractPDFData } from "@/types/contract-v2";

// ============================================================================
// TRANSFORMADOR A DATOS PARA PDF
// Este archivo prepara ContractGenerated + input usuario → ContractPDFData
// que el generador de PDF (v2) puede consumir directamente
// ============================================================================

/**
 * Convierte el contrato generado + input usuario a datos listos para PDF
 * Esta es la versión que usa el nuevo motor de contratos
 */
export function transformToPDFData(
  generated: {
    titulo: string;
    declaraciones: { parteA: string[]; parteB: string[] };
    clausulas: Array<{ numeroRomano: string; titulo: string; contenido: string }>;
    firma: { ciudad: string; fechaEnLetras: string; leyendaCompleta: string };
  },
  input: {
    parteA: { nombre: string; representante?: string };
    parteB: { nombre: string; representante?: string };
    firmas: { imagenA?: string; imagenB?: string; textoFirmaA?: string; textoFirmaB?: string };
  }
): ContractPDFData {
  return {
    titulo: generated.titulo,
    preambulo: "", // Se construye en el PDF generator v2
    declaraciones: {
      parteA: generated.declaraciones.parteA,
      parteB: generated.declaraciones.parteB,
    },
    clausulas: generated.clausulas.map(c => ({
      numeroRomano: c.numeroRomano,
      titulo: c.titulo,
      contenido: c.contenido,
    })),
    firma: {
      ciudad: generated.firma.ciudad,
      fechaEnLetras: generated.firma.fechaEnLetras,
      leyendaCompleta: generated.firma.leyendaCompleta,
      nombreA: input.parteA.nombre.toUpperCase(),
      nombreB: input.parteB.nombre.toUpperCase(),
      representanteA: input.parteA.representante?.toUpperCase(),
      representanteB: input.parteB.representante?.toUpperCase(),
      imagenA: input.firmas.imagenA,
      imagenB: input.firmas.imagenB,
      textoFirmaA: input.firmas.textoFirmaA,
      textoFirmaB: input.firmas.textoFirmaB,
    },
  };
}

/**
 * Helper para formatear moneda en el PDF
 */
export function formatCurrencyForPDF(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Helper para convertir número a letra (para montos en letra)
 * Versión simplificada - para producción usar librería completa
 */
export function numeroALetra(numero: number): string {
  const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const teens = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
  const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

  if (numero === 0) return "CERO";
  if (numero === 100) return "CIEN";

  let resultado = "";
  let millones = Math.floor(numero / 1_000_000);
  let miles = Math.floor((numero % 1_000_000) / 1000);
  let cientos = numero % 1000;

  if (millones > 0) {
    resultado += numeroALetra(millones) + (millones === 1 ? " MILLÓN " : " MILLONES ");
  }
  if (miles > 0) {
    resultado += numeroALetra(miles) + (miles === 1 ? " MIL " : " MIL ");
  }
  if (cientos > 0) {
    const c = Math.floor(cientos / 100);
    const d = Math.floor((cientos % 100) / 10);
    const u = cientos % 10;
    
    if (c > 0) resultado += centenas[c] + " ";
    if (d === 1) {
      resultado += teens[u] + " ";
    } else {
      if (d > 1) resultado += decenas[d] + (u > 0 ? " Y " : " ");
      if (u > 0) resultado += unidades[u] + " ";
    }
  }

  return resultado.trim();
}

/**
 * Convierte fecha ISO a formato "DD de MES de YYYY"
 */
export function fechaISOALetra(fechaISO: string): string {
  const date = new Date(fechaISO + "T00:00:00");
  const dias = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
    "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte",
    "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve", "treinta", "treinta y uno"];
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  
  const dia = date.getDate();
  const mes = meses[date.getMonth()];
  const anio = date.getFullYear();
  
  return `${dias[dia]} de ${mes} de ${anio}`;
}