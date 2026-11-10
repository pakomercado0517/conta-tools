import {
  ContractInput,
  ContractGenerated,
  ContractFinal,
  ContractPDFData,
  ContractClause,
  ClausulaUsuario,
  ClausulasEstandarSeleccionadas,
} from "@/types/contract-v2";
import { TERMINOLOGIA_POR_TIPO, numeroARomano } from "@/types/contract-v2";

// ============================================================================
// MOTOR DE ENSAMBLAJE DE CONTRATOS
// ============================================================================

/**
 * Combina el contrato generado por IA con las cláusulas que el usuario escribió
 * y quiere integrar (ya sea pulidas por IA o tal cual)
 */
export function mergeUserClauses(
  generated: ContractGenerated,
  input: ContractInput
): ContractGenerated {
  const clausulasUsuario = input.clausulasUsuario.filter(c => c.textoOriginal.trim().length > 0);
  
  if (clausulasUsuario.length === 0) {
    return generated;
  }

  // Cláusulas que el usuario quiere que se integren (pulidas o no)
  const clausulasAIntegrar = clausulasUsuario
    .filter(c => c.pulida || c.textoPulido) // Solo las que se pulieron o tienen texto pulido
    .sort((a, b) => a.orden - b.orden);

  if (clausulasAIntegrar.length === 0) {
    return generated;
  }

  // Crear nuevas cláusulas basadas en las del usuario
  const nuevasClausulas: ContractClause[] = clausulasAIntegrar.map((cu, index) => ({
    numero: generated.clausulas.length + index + 1,
    numeroRomano: numeroARomano(generated.clausulas.length + index + 1),
    titulo: extraerTituloDeClausula(cu.textoPulido || cu.textoOriginal),
    contenido: cu.textoPulido || cu.textoOriginal,
    esObligatoria: false,
    fuente: cu.pulida ? "ia-usuario" : "usuario",
  }));

  // Recalcular números romanos de todas las cláusulas
  const todasClausulas = [...generated.clausulas, ...nuevasClausulas];
  const clausulasReordenadas = todasClausulas.map((c, i) => ({
    ...c,
    numero: i + 1,
    numeroRomano: numeroARomano(i + 1),
  }));

  return {
    ...generated,
    clausulas: clausulasReordenadas,
    warnings: [
      ...(generated.warnings || []),
      `Se integraron ${nuevasClausulas.length} cláusula(s) del usuario`,
    ],
  };
}

/**
 * Extrae un título corto de una cláusula para usar como encabezado
 */
function extraerTituloDeClausula(texto: string): string {
  // Buscar primera frase o primeros 50 chars
  const primeraFrase = texto.split(/[.!?]/)[0]?.trim() || "";
  const palabras = primeraFrase.split(" ").slice(0, 8).join(" ");
  const titulo = palabras.length > 50 ? palabras.slice(0, 47) + "..." : palabras;
  
  // Capitalizar primera letra de cada palabra importante
  return titulo
    .split(" ")
    .map(w => w.length > 3 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())
    .join(" ")
    .replace(/\b(De|Del|La|El|Los|Las|Un|Una|Y|O|A|En|Con|Por|Para|Al|Se)\b/gi, m => m.toLowerCase());
}

/**
 * Valida la estructura completa del contrato generado
 */
export function validateContractStructure(
  contract: ContractGenerated,
  input: ContractInput
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Estructura básica
  if (!contract.declaraciones?.parteA?.length) {
    errors.push("Faltan declaraciones de Parte A");
  }
  if (!contract.declaraciones?.parteB?.length) {
    errors.push("Faltan declaraciones de Parte B");
  }
  if (!contract.clausulas?.length || contract.clausulas.length < 6) {
    errors.push(`Mínimo 6 cláusulas requeridas, hay ${contract.clausulas?.length || 0}`);
  }

  // 2. Numeración consecutiva
  for (let i = 0; i < contract.clausulas.length; i++) {
    if (contract.clausulas[i].numero !== i + 1) {
      warnings.push(`Cláusula ${i + 1} tiene número incorrecto: ${contract.clausulas[i].numero}`);
    }
    const romanoEsperado = numeroARomano(i + 1);
    if (contract.clausulas[i].numeroRomano !== romanoEsperado) {
      warnings.push(`Cláusula ${i + 1}: romano incorrecto (${contract.clausulas[i].numeroRomano} vs ${romanoEsperado})`);
    }
  }

  // 3. Cláusulas obligatorias por tipo
  const obligatorias = getClausulasObligatoriasPorTipo(input.tipoContrato);
  const titulos = contract.clausulas.map(c => c.titulo.toUpperCase());
  
  for (const oblig of obligatorias) {
    const found = titulos.some(t => t.includes(oblig.toUpperCase()));
    if (!found) {
      errors.push(`Cláusula obligatoria faltante para ${input.tipoContrato}: ${oblig}`);
    }
  }

  // 4. Firmas
  if (!contract.firma?.ciudad || !contract.firma?.fechaEnLetras || !contract.firma?.leyendaCompleta) {
    errors.push("Firma incompleta");
  }

  // 5. Terminología consistente
  const term = TERMINOLOGIA_POR_TIPO[input.tipoContrato];
  if (contract.terminologia.parteA !== term.parteA || contract.terminologia.parteB !== term.parteB) {
    warnings.push("Terminología de partes no estándar para este tipo de contrato");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Obtiene lista de cláusulas obligatorias por tipo (para validación)
 */
function getClausulasObligatoriasPorTipo(tipo: string): string[] {
  const base: Record<string, string[]> = {
    venta: ["OBJETO", "PRECIO", "ENTREGA", "GARANTÍA", "RESPONSABILIDAD LABORAL", "FACTURACIÓN", "JURISDICCIÓN"],
    arrendamiento: ["OBJETO", "RENTA", "ENTREGA", "OBLIGACIONES ARRENDADOR", "OBLIGACIONES ARRENDATARIO", "RESPONSABILIDAD LABORAL", "FACTURACIÓN", "JURISDICCIÓN"],
    servicios: ["OBJETO", "HONORARIO", "PRESTACIÓN", "OBLIGACIONES", "CONFIDENCIALIDAD", "RESPONSABILIDAD LABORAL", "FACTURACIÓN", "JURISDICCIÓN"],
    obra: ["OBJETO", "PRECIO", "EJECUCIÓN", "PLAZO", "GARANTÍA", "RESPONSABILIDAD LABORAL", "FACTURACIÓN", "JURISDICCIÓN"],
    mandato: ["OBJETO", "HONORARIO", "EJECUCIÓN", "OBLIGACIONES MANDATARIO", "RENDICIÓN CUENTAS", "RESPONSABILIDAD LABORAL", "FACTURACIÓN", "JURISDICCIÓN"],
    personalizado: ["OBJETO", "CONTRAPRESTACIÓN", "EJECUCIÓN", "OBLIGACIONES", "RESPONSABILIDAD LABORAL", "FACTURACIÓN", "JURISDICCIÓN"],
  };
  return base[tipo] || base.personalizado;
}

/**
 * Prepara los datos del contrato para el generador de PDF
 * Transforma ContractGenerated → ContractPDFData
 */
export function prepareForPDF(
  generated: ContractGenerated,
  input: ContractInput
): ContractPDFData {
  const term = TERMINOLOGIA_POR_TIPO[input.tipoContrato];
  
  // Construir preámbulo
  const preambulo = buildPreambulo(generated, input, term);

  // Nombres para firmas
  const nombreA = input.parteA.nombre.toUpperCase();
  const nombreB = input.parteB.nombre.toUpperCase();
  const repA = input.parteA.representante?.toUpperCase();
  const repB = input.parteB.representante?.toUpperCase();

  return {
    titulo: generated.titulo,
    preambulo,
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
      nombreA,
      nombreB,
      representanteA: repA,
      representanteB: repB,
      imagenA: input.firmas.imagenA,
      imagenB: input.firmas.imagenB,
      textoFirmaA: input.firmas.textoFirmaA,
      textoFirmaB: input.firmas.textoFirmaB,
    },
  };
}

/**
 * Construye el preámbulo del contrato (exposición)
 */
function buildPreambulo(
  generated: ContractGenerated,
  input: ContractInput,
  term: { parteA: string; parteB: string }
): string {
  const parteA = input.parteA;
  const parteB = input.parteB;
  const fechaElab = formatearFechaLetra(input.fechaElaboracion);

  let preambulo = `En **${fechaElab}**, en **${generated.firma.ciudad}**, se celebra el presente **${generated.titulo}** `;
  
  preambulo += `entre **${term.parteA}**, **${parteA.nombre}**`;
  if (parteA.esEmpresa && parteA.representante) {
    preambulo += `, representado por **${parteA.representante}**`;
  }
  preambulo += `, con domicilio en **${parteA.domicilio}**, `;
  
  preambulo += `y **${term.parteB}**, **${parteB.nombre}**`;
  if (parteB.esEmpresa && parteB.representante) {
    preambulo += `, representado por **${parteB.representante}**`;
  }
  preambulo += `, con domicilio en **${parteB.domicilio}**`;
  
  preambulo += `, a quienes en lo sucesivo se les denominará conjunta e indistintamente como **\"LAS PARTES\"**, `;
  preambulo += `al tenor de las siguientes declaraciones y cláusulas:`;

  return preambulo;
}

/**
 * Formatea fecha ISO a "D de mes de YYYY"
 */
function formatearFechaLetra(fechaISO: string): string {
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

/**
 * Crea el objeto ContractFinal completo para persistencia
 */
export function createContractFinal(
  input: ContractInput,
  generated: ContractGenerated
): ContractFinal {
  const now = new Date().toISOString();
  
  return {
    input,
    generated,
    estado: "generado",
    version: 1,
    creadoEn: now,
    actualizadoEn: now,
    generadoEn: now,
  };
}

/**
 * Actualiza un ContractFinal existente (nueva versión)
 */
export function updateContractFinal(
  existing: ContractFinal,
  input: ContractInput,
  generated: ContractGenerated
): ContractFinal {
  return {
    ...existing,
    input,
    generated,
    estado: "generado",
    version: existing.version + 1,
    actualizadoEn: new Date().toISOString(),
    generadoEn: new Date().toISOString(),
  };
}

/**
 * Filtra cláusulas estándar seleccionadas por el usuario
 * (Para pasárselas a la IA en el prompt)
 */
export function getSelectedStandardClauses(
  clausulasEstandar: ClausulasEstandarSeleccionadas
): string[] {
  return Object.entries(clausulasEstandar)
    .filter(([, selected]) => selected)
    .map(([key]) => key);
}

/**
 * Convierte cláusulas estándar seleccionadas a lista legible para el prompt
 */
export function formatStandardClausesForPrompt(
  clausulasEstandar: ClausulasEstandarSeleccionadas
): string {
  const labels: Record<keyof ClausulasEstandarSeleccionadas, string> = {
    responsabilidadLaboral: "Responsabilidad laboral / No solidaridad",
    facturacionFiscal: "Facturación y comprobantes fiscales (CFDI)",
    confidencialidad: "Confidencialidad y protección de información",
    penalizaciones: "Cláusula penal / Penalizaciones por incumplimiento",
    fuerzaMayor: "Fuerza mayor / Caso fortuito",
    terminacionAnticipada: "Terminación anticipada / Rescisión",
    notificaciones: "Notificaciones y domicilio para oír notificaciones",
    noCompetencia: "No competencia / Exclusividad",
    propiedadIntelectual: "Propiedad intelectual / Cesión de derechos",
  };

  return Object.entries(clausulasEstandar)
    .filter(([, v]) => v)
    .map(([k]) => `- ${labels[k as keyof ClausulasEstandarSeleccionadas]}`)
    .join("\n");
}

/**
 * Genera un ID único para cláusula usuario
 */
export function generateClauseId(): string {
  return crypto.randomUUID();
}

/**
 * Crea una cláusula usuario vacía para el formulario
 */
export function createEmptyUserClause(orden: number): ClausulaUsuario {
  return {
    id: generateClauseId(),
    textoOriginal: "",
    orden,
    pulida: false,
  };
}