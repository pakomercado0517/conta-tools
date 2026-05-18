/**
 * Prompts del generador de conceptos con IA.
 * Cotizaciones y contratos usan system instructions distintas.
 */

export const DEFAULT_SYSTEM_INSTRUCTION =
  "Eres un asistente especializado en crear conceptos profesionales y descripciones para cotizaciones y contratos. Responde de manera concisa, profesional y en español.";

export const QUOTATION_SYSTEM_INSTRUCTION = `Eres un redactor técnico experto en presupuestos, licitaciones y contratos comerciales.
Tu única tarea es transformar la solicitud del usuario en un concepto formal, técnico y ejecutivo apto para el cuerpo de una cotización.

Reglas estrictas de cumplimiento:
1. Inicia directamente con el concepto. Prohibido usar introducciones, saludos o explicaciones (ej. NO uses "Aquí tienes...", "Concepto para...", "Se proporciona...").
2. Adopta una postura ejecutiva de prestador de servicios. Describe la ejecución del trabajo, no el acto de cotizarlo ni opines como asistente.
3. Redacta con verbos en infinitivo o sustantivos de acción, como en conceptos profesionales de cotización.
4. Utiliza lenguaje técnico descriptivo (menciona normativas, seguridad, materiales o mano de obra de forma implícita).
5. Sé extremadamente conciso. Si puedes describir el alcance con alta calidad en 40 palabras, no uses 100.`;

/**
 * User prompt para un ítem de cotización.
 * @param concept - Texto base del usuario (descripción o concepto del ítem)
 */
export function buildQuotationUserPrompt(concept: string): string {
  return `Genera la descripción técnica y ejecutiva para el siguiente ítem de cotización: "${concept}".

Restricciones: Máx. 100 palabras. Lenguaje formal. Omite introducciones.`;
}

export type ContractProductType = "venta" | "servicio";

export const CONTRACT_OBJECT_SYSTEM_INSTRUCTION = `Eres un redactor técnico legal. Tu único trabajo es completar de forma técnica y precisa una frase contractual que ya ha sido iniciada.

Reglas estrictas de cumplimiento:
1. NO repitas la introducción, ni uses "El prestador se obliga a", ni nombres de cláusulas.
2. Inicia tu respuesta DIRECTAMENTE con un verbo en infinitivo (ej: "ejecutar", "realizar", "dar", "desarrollar", "instalar") que conecte gramaticalmente con la frase de apertura.
3. Describe el alcance técnico, materiales, normativas y características del trabajo.
4. Entrega texto plano y puro, sin preámbulos, saludos ni explicaciones.`;

/**
 * Frase de apertura de PRIMERA. OBJETO según el template del contrato (PDF / vista previa).
 */
export function getContractClauseOpening(
  tipoProducto: ContractProductType
): string {
  if (tipoProducto === "servicio") {
    return "PRIMERA. OBJETO: EL PRESTADOR DE SERVICIOS se obliga a prestar los servicios consistentes en:";
  }

  return "PRIMERA. OBJETO: EL VENDEDOR se obliga a transmitir la propiedad sin reserva de dominio, libre de gravamen y limitación alguna de los materiales/servicios consistentes en:";
}

/**
 * User prompt para autocompletar el objeto del contrato (campo servicios en el generador).
 */
export function buildContractObjectUserPrompt(
  concept: string,
  tipoProducto: ContractProductType
): string {
  const opening = getContractClauseOpening(tipoProducto);

  return `La cláusula de mi contrato inicia exactamente así:
"${opening}"

Continúa la frase anterior describiendo de forma técnica y formal el siguiente concepto: "${concept}".

Restricciones:
- Inicia tu respuesta directamente con un verbo en infinitivo que conecte con la frase anterior.
- Máximo 120 palabras.
- No repitas nada de la frase inicial. Entrega solo el complemento técnico.`;
}
