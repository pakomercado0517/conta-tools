import { ContractGenerated, ContractOperation, ChatMessage, TERMINOLOGIA_POR_TIPO } from "@/types/contract-v2";
import { parseJsonLenient } from "@/lib/ai/json-repair";

// ============================================================================
// SYSTEM PROMPT PARA CHAT DE MODIFICACIÓN DE CONTRATOS
// ============================================================================

export const SYSTEM_PROMPT_CHAT = `Eres un abogado especialista en derecho civil y mercantil mexicano con 20 años de experiencia. 
Tu tarea es MODIFICAR contratos ya generados basándote en instrucciones del usuario en lenguaje natural.

REGLAS ESTRICTAS:
1. RESPONDE SOLO JSON VÁLIDO con la estructura especificada. Nada de explicaciones fuera del JSON.
2. Analiza el contrato actual y la instrucción del usuario para determinar qué operaciones atómicas aplicar.
3. Las operaciones deben ser precisas y mínimas (una operación por cambio lógico).
4. NUNCA inventes datos. Si el usuario pide algo ambiguo, pide clarificación en "explicacion".
5. Mantén la validez legal del contrato: cláusulas obligatorias no se pueden eliminar.
6. Usa números romanos exactos: "PRIMERA", "SEGUNDA", "TERCERA", "CUARTA", "QUINTA", "SEXTA", "SÉPTIMA", "OCTAVA", "NOVENA", "DÉCIMA", "DÉCIMA PRIMERA", "DÉCIMA SEGUNDA".

TIPOS DE OPERACIONES DISPONIBLES:
- ELIMINAR_CLAUSULA: { "tipo": "ELIMINAR_CLAUSULA", "numeroRomano": "QUINTA" }
- MODIFICAR_CLAUSULA: { "tipo": "MODIFICAR_CLAUSULA", "numeroRomano": "TERCERA", "nuevoContenido": "..." }
- INSERTAR_CLAUSULA: { "tipo": "INSERTAR_CLAUSULA", "despuesDe": "SEGUNDA", "clausula": { "titulo": "CONFIDENCIALIDAD", "contenido": "...", "fuente": "ia-usuario", "esObligatoria": false } }
- CAMPO_GLOBAL: { "tipo": "CAMPO_GLOBAL", "campo": "jurisdiccion"|"fechaFin"|"monto"|"iva"|"tipoPago"|"condicionesPago", "valor": ... }
- REORDENAR_CLAUSULAS: { "tipo": "REORDENAR_CLAUSULAS", "orden": ["PRIMERA", "TERCERA", "SEGUNDA", "CUARTA"] }
- TOGGLE_CLAUSULA_ESTANDAR: { "tipo": "TOGGLE_CLAUSULA_ESTANDAR", "clave": "penalizaciones"|"confidencialidad"|"fuerzaMayor"|"terminacionAnticipada"|"noCompetencia"|"propiedadIntelectual", "activo": true|false }

CAMPOS GLOBALES VÁLIDOS:
- "jurisdiccion": string (ciudad/estado)
- "fechaFin": { tipo: "fecha_exacta"|"indefinido"|"hasta_terminar"|"personalizado", fechaExacta?: string, textoPersonalizado?: string }
- "monto": number (en MXN)
- "iva": "incluido"|"separado"|"exento"
- "tipoPago": "una_exhibicion"|"parcialidades"|"otro"
- "condicionesPago": string

REGLAS POR TIPO DE CONTRATO:
- Cláusulas obligatorias NUNCA se pueden eliminar (ver lista en contrato actual)
- El orden de cláusulas debe mantener lógica jurídica
- Al insertar, "despuesDe" debe ser un número romano existente
- Al reordenar, el array "orden" debe contener TODAS las cláusulas actuales

FORMATO DE RESPUESTA OBLIGATORIO:
{
  "operations": [ ... array de operaciones ... ],
  "explicacion": "Explicación breve en español de qué se hizo y por qué"
}

EJEMPLOS:

Usuario: "Quita la cláusula penal"
Respuesta: { "operations": [{ "tipo": "ELIMINAR_CLAUSULA", "numeroRomano": "QUINTA" }], "explicacion": "Se eliminó la cláusula QUINTA (Cláusula Penal) como solicitaste." }

Usuario: "Cambia la jurisdicción a Monterrey, Nuevo León"
Respuesta: { "operations": [{ "tipo": "CAMPO_GLOBAL", "campo": "jurisdiccion", "valor": "Monterrey, Nuevo León" }], "explicacion": "Se actualizó la jurisdicción a Monterrey, Nuevo León." }

Usuario: "Agrega una cláusula de confidencialidad después de la cláusula de precio"
Respuesta: { "operations": [{ "tipo": "INSERTAR_CLAUSULA", "despuesDe": "SEGUNDA", "clausula": { "titulo": "CONFIDENCIALIDAD", "contenido": "Las Partes se obligan a mantener estricta confidencialidad sobre toda información intercambiada...", "fuente": "ia-usuario", "esObligatoria": false } }], "explicacion": "Se insertó cláusula de Confidencialidad después de la SEGUNDA (Precio)." }

Usuario: "Sube el monto a 150,000 pesos"
Respuesta: { "operations": [{ "tipo": "CAMPO_GLOBAL", "campo": "monto", "valor": 150000 }], "explicacion": "Se actualizó el monto total a $150,000.00 MXN." }

Usuario: "Quita la cláusula de fuerza mayor"
Respuesta: { "operations": [{ "tipo": "TOGGLE_CLAUSULA_ESTANDAR", "clave": "fuerzaMayor", "activo": false }], "explicacion": "Se desactivó la cláusula estándar de Fuerza Mayor." }`;

// ============================================================================
// BUILDER DEL USER PROMPT PARA CHAT
// ============================================================================

export function buildChatUserPrompt(
  contract: ContractGenerated,
  message: string,
  history: ChatMessage[]
): string {
  const terminologia = TERMINOLOGIA_POR_TIPO[contract.tipoContrato];
  
  // Resumen del contrato actual para contexto
  const clausulasResumen = contract.clausulas.map(c => 
    `${c.numeroRomano}. ${c.titulo} (${c.fuente}${c.esObligatoria ? ", obligatoria" : ""})`
  ).join("\n");

  const historialReciente = history.slice(-6).map(m => 
    `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.content}`
  ).join("\n");

  return `CONTRATO ACTUAL:
Tipo: ${contract.tipoContrato.toUpperCase()}
Título: ${contract.titulo}
${terminologia.parteA} vs ${terminologia.parteB}
Jurisdicción: ${contract.firma.ciudad}

CLÁUSULAS ACTUALES (${contract.clausulas.length}):
${clausulasResumen}

HISTORIAL RECIENTE (últimos 6):
${historialReciente || "(sin historial previo)"}

MENSAJE DEL USUARIO:
"${message}"

INSTRUCCIÓN: Analiza el mensaje y genera las operaciones JSON necesarias para modificar el contrato. 
Si el mensaje es ambiguo, genera una operación vacía y explica en "explicacion" qué necesitas aclarar.
RECUERDA: Solo JSON válido.`;
}

// ============================================================================
// PARSER DE RESPUESTA DEL CHAT
// ============================================================================

export interface ChatParseResult {
  operations: ContractOperation[];
  explicacion: string;
  valid: boolean;
  errors: string[];
}

export function parseChatResponse(rawContent: string): ChatParseResult {
  const errors: string[] = [];
  let operations: ContractOperation[] = [];
  let explicacion = "";

  try {
    const parsed = parseJsonLenient(rawContent) as Record<string, unknown>;

    if (!parsed.operations || !Array.isArray(parsed.operations)) {
      errors.push("Campo 'operations' faltante o no es array");
    } else {
      operations = parsed.operations as ContractOperation[];
    }

    if (!parsed.explicacion || typeof parsed.explicacion !== "string") {
      errors.push("Campo 'explicacion' faltante");
    } else {
      explicacion = parsed.explicacion;
    }

    // Validar cada operación
    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      const opErrors = validateOperation(op, i);
      errors.push(...opErrors);
    }

  } catch (e) {
    errors.push(`JSON inválido: ${(e as Error).message}`);
  }

  return {
    operations,
    explicacion,
    valid: errors.length === 0,
    errors,
  };
}

function validateOperation(op: ContractOperation, index: number): string[] {
  const errors: string[] = [];
  const prefix = `Operación ${index + 1}:`;

  if (!op.tipo) {
    errors.push(`${prefix} Falta campo 'tipo'`);
    return errors;
  }

  switch (op.tipo) {
    case "ELIMINAR_CLAUSULA":
      if (!op.numeroRomano) errors.push(`${prefix} ELIMINAR_CLAUSULA requiere 'numeroRomano'`);
      break;
    case "MODIFICAR_CLAUSULA":
      if (!op.numeroRomano) errors.push(`${prefix} MODIFICAR_CLAUSULA requiere 'numeroRomano'`);
      if (!op.nuevoContenido) errors.push(`${prefix} MODIFICAR_CLAUSULA requiere 'nuevoContenido'`);
      break;
    case "INSERTAR_CLAUSULA":
      if (!op.despuesDe) errors.push(`${prefix} INSERTAR_CLAUSULA requiere 'despuesDe'`);
      if (!op.clausula) errors.push(`${prefix} INSERTAR_CLAUSULA requiere 'clausula'`);
      else {
        if (!op.clausula.titulo) errors.push(`${prefix} clausula.titulo requerido`);
        if (!op.clausula.contenido) errors.push(`${prefix} clausula.contenido requerido`);
      }
      break;
    case "CAMPO_GLOBAL":
      if (!op.campo) errors.push(`${prefix} CAMPO_GLOBAL requiere 'campo'`);
      if (op.valor === undefined) errors.push(`${prefix} CAMPO_GLOBAL requiere 'valor'`);
      const camposValidos = ["jurisdiccion", "fechaFin", "monto", "iva", "tipoPago", "condicionesPago"];
      if (op.campo && !camposValidos.includes(op.campo)) {
        errors.push(`${prefix} Campo global inválido: ${op.campo}. Válidos: ${camposValidos.join(", ")}`);
      }
      break;
    case "REORDENAR_CLAUSULAS":
      if (!op.orden || !Array.isArray(op.orden) || op.orden.length === 0) {
        errors.push(`${prefix} REORDENAR_CLAUSULAS requiere 'orden' array no vacío`);
      }
      break;
    case "TOGGLE_CLAUSULA_ESTANDAR":
      if (!op.clave) errors.push(`${prefix} TOGGLE_CLAUSULA_ESTANDAR requiere 'clave'`);
      if (typeof op.activo !== "boolean") errors.push(`${prefix} 'activo' debe ser boolean`);
      const clavesValidas = ["responsabilidadLaboral", "facturacionFiscal", "confidencialidad", "penalizaciones", "fuerzaMayor", "terminacionAnticipada", "notificaciones", "noCompetencia", "propiedadIntelectual"];
      if (op.clave && !clavesValidas.includes(op.clave)) {
        errors.push(`${prefix} Clave inválida: ${op.clave}. Válidas: ${clavesValidas.join(", ")}`);
      }
      break;
    default:
      errors.push(`${prefix} Tipo de operación desconocido: ${(op as { tipo: string }).tipo}`);
  }

  return errors;
}