import {
  ContractInput,
  ContractGenerated,
  TipoContrato,
  TERMINOLOGIA_POR_TIPO,
  CLAUSULAS_OBLIGATORIAS_POR_TIPO,
} from "@/types/contract-v2";
import { parseJsonLenient } from "@/lib/ai/json-repair";

// ============================================================================
// SYSTEM PROMPT MAESTRO - ABOGADO EXPERTO MEXICANO
// ============================================================================

export const SYSTEM_PROMPT_MAESTRO = `Eres un abogado especialista en derecho civil, mercantil y obligaciones en México, con 20 años de experiencia redactando contratos para notarías, corporativos y personas físicas. Conoces a la perfección:

- Código Civil Federal y Códigos Civiles estatales
- Código de Comercio
- Ley Federal del Derecho de Autor (para contratos de obra)
- NOM-151-SCFI-2016 (conservación de mensajes de datos)
- Jurisprudencia de la SCJN en materia contractual
- Formalismos notariales y registrales

TAREA: Generar un CONTRATO COMPLETO, VÁLIDO Y EJECUTABLE en México, basado ÚNICAMENTE en los datos que te proporciona el usuario.

REGLAS ESTRICTAS - INCUMPLIR CUALQUIERA INVALIDA LA RESPUESTA:
1. RESPONDE SOLO JSON VÁLIDO. Nada de explicaciones, markdown, ni texto fuera del JSON. El JSON debe ser parseable directamente.
2. Usa terminología jurídica mexicana correcta (no "cliente/proveedor" genérico). Usa los términos que te indiquen en "terminología".
3. Incluye TODAS las cláusulas obligatorias según el tipo de contrato (ver lista en prompt).
4. Adapta cláusulas al tipo: compraventa ≠ arrendamiento ≠ prestación de servicios ≠ obra ≠ mandato.
5. Redacta en español formal jurídico mexicano (voseo legal: "obligándose", "comprometiéndose"; infinitivos de obligación: "entregar", "pagar", "prestar").
6. Incluye **negritas** (markdown **texto**) para conceptos clave: nombres de partes, montos, fechas, obligaciones principales, plazos.
7. Las fechas en el JSON van en ISO (YYYY-MM-DD); en el contenido van en letra (ej: "veinticinco de septiembre de dos mil veintiséis").
8. Si el usuario pide cláusulas extra, integrarlas con tono jurídico coherente en el orden lógico correspondiente.
9. NUNCA inventes datos que no te dieron. Si falta un dato esencial, usa placeholders [ENTRE CORCHETES MAYÚSCULAS] solo para: domicilios completos si no los dieron, representantes si no los dieron, datos bancarios si no los dieron.
10. El contrato debe poder firmarse y tener validez legal inmediata.
11. El campo "contenido" de cada cláusula debe ser UN SOLO STRING con párrafos separados por \\n\\n (doble salto de línea).
12. Número romano en "numeroRomano": "PRIMERA", "SEGUNDA", "TERCERA", etc. (sin punto final).
13. "fuente": "ia-estandar" para cláusulas base, "ia-usuario" para cláusulas que el usuario pidió pulir, "usuario" para cláusulas que el usuario escribió y no quiso pulir.

ESTRUCTURA OBLIGATORIA DEL JSON DE RESPUESTA:
{
  "tipoContrato": "venta|arrendamiento|servicios|obra|mandato|personalizado",
  "titulo": "CONTRATO DE COMPRAVENTA DE [BIEN/SERVICIO]",
  "terminologia": { "parteA": "EL VENDEDOR", "parteB": "EL COMPRADOR", "objeto": "bien" },
  "declaraciones": {
    "parteA": [ "I. DECLARA EL VENDEDOR...", "A. Es una persona moral...", "B. Tiene su domicilio...", "C. Cuenta con facultades...", "D. Es su deseo transmitir..." ],
    "parteB": [ "II. DECLARA EL COMPRADOR...", "A. Es una persona física...", "B. Tiene su domicilio...", "C. Cuenta con facultades...", "D. Es su deseo adquirir...", "E. Cumple obligaciones laborales..." ]
  },
  "clausulas": [
    { "numero": 1, "numeroRomano": "PRIMERA", "titulo": "OBJETO", "contenido": "**EL VENDEDOR** se obliga a transmitir la propiedad... **EL COMPRADOR** se obliga a pagar...", "esObligatoria": true, "fuente": "ia-estandar" },
    { "numero": 2, "numeroRomano": "SEGUNDA", "titulo": "PRECIO Y FORMA DE PAGO", "contenido": "Las Partes acuerdan que el precio total será de **$XXX MXN**...", "esObligatoria": true, "fuente": "ia-estandar" },
    ...
  ],
  "firma": {
    "ciudad": "Ciudad de México",
    "fechaEnLetras": "veinticinueve de septiembre de dos mil veintiséis",
    "leyendaCompleta": "Leído que fue el presente Contrato y enteradas las Partes de su contenido y alcance legal, lo firman por duplicado en **Ciudad de México** a **veinticinueve de septiembre de dos mil veintiséis**."
  },
  "generadoEn": "2025-09-29T14:30:00.000Z",
  "modeloUsado": "nvidia/nemotron-3-ultra-550b-a55b:free",
  "tokensUsados": 4521,
  "warnings": []
}

DETALLES POR TIPO DE CONTRATO:

=== VENTA (compraventa) ===
Cláusulas obligatorias: OBJETO, PRECIO Y FORMA DE PAGO, ENTREGA, GARANTÍAS (vicios ocultos, saneamiento), RESPONSABILIDAD LABORAL, FACTURACIÓN, JURISDICCIÓN
Particularidades: Transferencia de propiedad, tradición, saneamiento por evicción y vicios ocultos (CCF Arts. 2262-2285), IVA en venta de bienes.

=== ARRENDAMIENTO ===
Cláusulas obligatorias: OBJETO (descripción inmueble), RENTA Y FORMA DE PAGO, ENTREGA DEL INMUEBLE, OBLIGACIONES DEL ARRENDADOR (mantenimiento mayor, tranquilidad), OBLIGACIONES DEL ARRENDATARIO (uso, cuidado, mejoras), RESPONSABILIDAD LABORAL, FACTURACIÓN, JURISDICCIÓN
Particularidades: Uso y goce temporal, renta periódica, subarrendamiento, mejoras, resciliación (CCF Arts. 2434-2524).

=== PRESTACIÓN DE SERVICIOS ===
Cláusulas obligatorias: OBJETO (alcance, entregables), HONORARIOS Y FORMA DE PAGO, PRESTACIÓN DE SERVICIOS (plazos, hitos, aceptación), OBLIGACIONES DE LAS PARTES, CONFIDENCIALIDAD, RESPONSABILIDAD LABORAL (subcontratación), FACTURACIÓN, JURISDICCIÓN
Particularidades: Resultado vs medios, propiedad intelectual de entregables, confidencialidad, no competencia opcional.

=== OBRA ===
Cláusulas obligatorias: OBJETO (proyecto, planos, especificaciones), PRECIO Y FORMA DE PAGO (avances, retención), EJECUCIÓN DE LA OBRA (plazo, dirección técnica), PLAZOS Y ENTREGA (recepción provisional/definitiva), GARANTÍAS (vicios ocultos 10 años Art. 2634 CCF), RESPONSABILIDAD LABORAL, FACTURACIÓN, JURISDICCIÓN
Particularidades: Contratista independiente, materiales, planos, responsabilidad solidaria subcontratistas.

=== MANDATO ===
Cláusulas obligatorias: OBJETO (actos a realizar), HONORARIOS Y FORMA DE PAGO, EJECUCIÓN DEL MANDATO (instrucciones, rendición cuentas), OBLIGACIONES DEL MANDATARIO (diligencia, cuenta), RENDICIÓN DE CUENTAS, RESPONSABILIDAD LABORAL, FACTURACIÓN, JURISDICCIÓN
Particularidades: Representación, actuación por cuenta ajena, revocabilidad, cuenta final.

=== PERSONALIZADO ===
Cláusulas obligatorias: OBJETO, CONTRAPRESTACIÓN Y FORMA DE PAGO, EJECUCIÓN, OBLIGACIONES DE LAS PARTES, RESPONSABILIDAD LABORAL, FACTURACIÓN, JURISDICCIÓN`;

export const SYSTEM_PROMPT_POLISH_CLAUSE = `Eres un abogado especialista en redacción jurídica mexicana. Tu única tarea es tomar una cláusula redactada por un usuario lego y darle tono jurídico profesional, manteniendo su sentido original.

REGLAS:
1. RESPONDE SOLO JSON VÁLIDO con estructura: { "textoPulido": "...", "cambiosPrincipales": ["...", "..."] }
2. Mantén el significado exacto que el usuario quiso dar.
3. Eleva el lenguaje: vocabulario jurídico, estructura lógica, infinitivos de obligación, referencias legales implícitas.
4. Agrega **negritas** (markdown) a conceptos clave: partes, montos, plazos, obligaciones.
5. No inventes obligaciones nuevas ni cambies el fondo.
6. Si la cláusula del usuario es confusa/contradictoria, corrige la redacción pero mantén la intención.
7. Máximo 3000 caracteres en textoPulido.`;

// ============================================================================
// BUILDER DEL USER PROMPT PRINCIPAL
// ============================================================================

export function buildUserPrompt(input: ContractInput): string {
  const terminologia = TERMINOLOGIA_POR_TIPO[input.tipoContrato];
  const clausulasEstandar = input.clausulasEstandar;
  const clausulasUsuario = input.clausulasUsuario.filter(c => c.textoOriginal.trim().length > 0);

  // Formatear fechas para el prompt
  const fechaElaboracion = formatearFechaParaPrompt(input.fechaElaboracion);
  const fechaInicio = formatearFechaParaPrompt(input.fechaInicioVigencia);
  const fechaFin = formatearFechaFinParaPrompt(input.fechaFinVigencia);

  // Formatear monto
  const montoFormateado = formatearMonto(input.montoTotal);
  const ivaTexto = input.iva === "incluido" ? "IVA INCLUIDO (16%)" : 
                   input.iva === "separado" ? "IVA SEPARADO (16% adicional)" : "EXENTO DE IVA";

  // Formatear pago
  const tipoPagoTexto = input.tipoPago === "una_exhibicion" ? "PAGO EN UNA SOLA EXHIBICIÓN" :
                        input.tipoPago === "parcialidades" ? "PAGO EN PARCIALIDADES" : "OTRO TIPO DE PAGO";

  // Partes
  const parteA = input.parteA;
  const parteB = input.parteB;

  // Cláusulas estándar seleccionadas
  const clausulasEstandarSeleccionadas = Object.entries(clausulasEstandar)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(", ");

  // Cláusulas usuario
  const clausulasUsuarioTexto = clausulasUsuario.length > 0
    ? clausulasUsuario.map((c, i) => `${i + 1}. ${c.textoOriginal}`).join("\n")
    : "Ninguna";

  return `GENERA UN CONTRATO COMPLETO TIPO: ${input.tipoContrato.toUpperCase()}

DATOS DEL USUARIO:

=== PARTES ===
${terminologia.parteA} (Parte A):
- Nombre/Razón Social: ${parteA.nombre}
- ¿Es empresa?: ${parteA.esEmpresa ? "SÍ" : "NO"}${parteA.esEmpresa && parteA.representante ? `\n- Representante Legal: ${parteA.representante}` : ""}
- Domicilio: ${parteA.domicilio}

${terminologia.parteB} (Parte B):
- Nombre/Razón Social: ${parteB.nombre}
- ¿Es empresa?: ${parteB.esEmpresa ? "SÍ" : "NO"}${parteB.esEmpresa && parteB.representante ? `\n- Representante Legal: ${parteB.representante}` : ""}
- Domicilio: ${parteB.domicilio}

=== OBJETO ===
Descripción: ${input.objetoDescripcion}
Tipo de objeto: ${terminologia.objeto}

=== FECHAS ===
- Fecha de elaboración del contrato: ${fechaElaboracion}
- Fecha de inicio de vigencia: ${fechaInicio}
- Fecha de fin de vigencia: ${fechaFin}

=== PAGO ===
- Monto total: ${montoFormateado} MXN (${ivaTexto})
- Tipo de pago: ${tipoPagoTexto}${input.condicionesPago ? `\n- Condiciones de pago: ${input.condicionesPago}` : ""}${input.metodoPago ? `\n- Método de pago: ${input.metodoPago}` : ""}

=== JURISDICCIÓN ===
- Ciudad/Estado para fuero: ${input.jurisdiccion}

=== CLÁUSULAS ESTÁNDAR SOLICITADAS (incluir todas marcadas) ===
${clausulasEstandarSeleccionadas || "Todas las obligatorias por tipo"}

=== CLÁUSULAS EXTRA DEL USUARIO (integrar con tono jurídico en orden lógico) ===
${clausulasUsuarioTexto}

=== FIRMAS ===
${input.firmas.imagenA ? "- Firma imagen Parte A: SÍ" : "- Firma imagen Parte A: NO"}${input.firmas.textoFirmaA ? `\n- Texto firma Parte A: ${input.firmas.textoFirmaA}` : ""}
${input.firmas.imagenB ? "- Firma imagen Parte B: SÍ" : "- Firma imagen Parte B: NO"}${input.firmas.textoFirmaB ? `\n- Texto firma Parte B: ${input.firmas.textoFirmaB}` : ""}

INSTRUCCIONES ESPECÍFICAS PARA ESTE CONTRATO:
${getInstruccionesEspecificasPorTipo(input.tipoContrato, input, terminologia)}

RECUERDA: Responde SOLO el JSON válido.`;
}

// ============================================================================
// INSTRUCCIONES ESPECÍFICAS POR TIPO
// ============================================================================

function getInstruccionesEspecificasPorTipo(
  tipo: TipoContrato,
  input: ContractInput,
  terminologia: { parteA: string; parteB: string; objeto: string }
): string {
  const base = `
- En DECLARACIONES: Incluye capacidad, domicilio, facultades de representantes (si aplican), voluntad de ${tipo === "venta" ? "transmitir/adquirir propiedad" : tipo === "arrendamiento" ? "dar/recibir en arrendamiento" : tipo === "servicios" ? "prestar/recibir servicios" : tipo === "obra" ? "ejecutar/recibir obra" : "ejecutar/recibir mandato"}.
- En CLAUSULA PRIMERA (OBJETO): Describe técnicamente ${input.objetoDescripcion}. Usa "${terminologia.parteA} se obliga a ${getVerboObligacion(tipo)}..." y "${terminologia.parteB} se obliga a ${getVerboContraprestacion(tipo)}...".
- En CLAUSULA SEGUNDA (PRECIO/PAGO): Monto en número y letra. Especifica ${input.iva === "incluido" ? "IVA incluido en el precio" : input.iva === "separado" ? "IVA (16%) adicional al precio" : "exento de IVA"}. ${input.tipoPago === "parcialidades" ? "Detalla calendario de pagos según condiciones." : input.tipoPago === "otro" ? "Especifica condiciones personalizadas." : "Pago en una exhibición al momento de la firma/entrega."}${input.metodoPago ? ` Método: ${input.metodoPago}.` : ""}
`;

  switch (tipo) {
    case "venta":
      return base + `
- CLAUSULA TERCERA (ENTREGA): Lugar, fecha, forma de entrega, acta de recepción, traslado de riesgos.
- CLAUSULA CUARTA (GARANTÍAS): Saneamiento por evicción y vicios ocultos (CCF Arts. 2262-2285). Plazos de reclamación.
- CLAUSULA QUINTA (RESPONSABILIDAD LABORAL): Independencia de partes, no solidaridad laboral.
- CLAUSULA SEXTA (FACTURACIÓN): Emisión de CFDI por cada pago.
- CLAUSULA SÉPTIMA (JURISDICCIÓN): ${input.jurisdiccion}, ley mexicana, renuncia fuero propio.`;

    case "arrendamiento":
      return base + `
- CLAUSULA TERCERA (ENTREGA DEL INMUEBLE): Estado actual, inventario si amueblado, acta de entrega-recepción.
- CLAUSULA CUARTA (OBLIGACIONES DEL ARRENDADOR): Mantenimiento mayor, tranquilidad en el uso, pagos prediales/agua si acordado.
- CLAUSULA QUINTA (OBLIGACIONES DEL ARRENDATARIO): Uso pactado, cuidado, avisar desperfectos, no subarrendar sin consentimiento.
- CLAUSULA SEXTA (MEJORAS Y REPARACIONES): Clasificación, reembolso, indemnización.
- CLAUSULA SÉPTIMA (RESPONSABILIDAD LABORAL): Independencia, no relación laboral.
- CLAUSULA OCTAVA (FACTURACIÓN): CFDI por renta (arrendamiento gravado IVA).
- CLAUSULA NOVENA (JURISDICCIÓN): ${input.jurisdiccion}, ley aplicable.`;

    case "servicios":
      return base + `
- CLAUSULA TERCERA (PRESTACIÓN DE SERVICIOS): Alcance detallado, hitos/entregables, plazos, criterios de aceptación, revisiones.
- CLAUSULA CUARTA (OBLIGACIONES DE LAS PARTES): Info/accesos del cliente, diligencia del prestador, confidencialidad mutua.
- CLAUSULA QUINTA (CONFIDENCIALIDAD): Definición, alcance, excepciones, vigencia post-contrato (mín 2 años).
- CLAUSULA SEXTA (PROPIEDAD INTELECTUAL - si aplica): Titularidad de entregables, cesión de derechos.
- CLAUSULA SÉPTIMA (RESPONSABILIDAD LABORAL): Prestador independiente, propio personal, seguridad social.
- CLAUSULA OCTAVA (FACTURACIÓN): CFDI por honorarios (retenciones ISR/IVA si PF).
- CLAUSULA NOVENA (JURISDICCIÓN): ${input.jurisdiccion}.`;

    case "obra":
      return base + `
- CLAUSULA TERCERA (EJECUCIÓN DE LA OBRA): Programa de trabajo, dirección técnica/residente, materiales, planos, especificaciones.
- CLAUSULA CUARTA (PLAZOS Y ENTREGA): Fecha inicio/fin, prórrogas, recepción provisional/definitiva, actas, vicios aparentes/ocultos.
- CLAUSULA QUINTA (GARANTÍAS): Vicios ocultos 10 años (Art. 2634 CCF), fianza/retención si pactada.
- CLAUSULA SEXTA (RESPONSABILIDAD LABORAL Y SOLIDARIDAD): Subcontratistas, responsabilidad solidaria Arts. 15 y 16 LFT.
- CLAUSULA SÉPTIMA (FACTURACIÓN): CFDI por obra (retenciones según régimen).
- CLAUSULA OCTAVA (JURISDICCIÓN): ${input.jurisdiccion}.`;

    case "mandato":
      return base + `
- CLAUSULA TERCERA (EJECUCIÓN DEL MANDATO): Actos específicos, límites, instrucciones, sustitución.
- CLAUSULA CUARTA (OBLIGACIONES DEL MANDATARIO): Diligencia de buen padre de familia, rendición de cuentas, no exceder poderes.
- CLAUSULA QUINTA (RENDICIÓN DE CUENTAS): Periodicidad, formato, comprobantes, liquidación final.
- CLAUSULA SEXTA (REVOCACIÓN Y RENUNCIA): Forma, efectos, liquidación.
- CLAUSULA SÉPTIMA (RESPONSABILIDAD LABORAL): Mandatario independiente.
- CLAUSULA OCTAVA (FACTURACIÓN): CFDI por honorarios de mandato.
- CLAUSULA NOVENA (JURISDICCIÓN): ${input.jurisdiccion}.`;

    default:
      return base + `
- Cláusulas estándar: objeto, contraprestación/pago, ejecución, obligaciones partes, responsabilidad laboral, facturación, jurisdicción en ${input.jurisdiccion}.`;
  }
}

function getVerboObligacion(tipo: TipoContrato): string {
  switch (tipo) {
    case "venta": return "transmitir la propiedad del bien";
    case "arrendamiento": return "dar en arrendamiento el inmueble";
    case "servicios": return "prestar los servicios consistentes en";
    case "obra": return "ejecutar la obra consistente en";
    case "mandato": return "realizar los actos de mandato consistentes en";
    default: return "ejecutar el objeto consistente en";
  }
}

function getVerboContraprestacion(tipo: TipoContrato): string {
  switch (tipo) {
    case "venta": return "pagar el precio convenido";
    case "arrendamiento": return "pagar la renta en los términos pactados";
    case "servicios": return "pagar los honorarios convenidos";
    case "obra": return "pagar el precio de la obra";
    case "mandato": return "pagar los honorarios y reembolsar gastos";
    default: return "cumplir la contraprestación pactada";
  }
}

// ============================================================================
// FORMATTERS
// ============================================================================

function formatearFechaParaPrompt(fechaISO: string): string {
  const date = new Date(fechaISO + "T00:00:00");
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatearFechaFinParaPrompt(fechaFin: ContractInput["fechaFinVigencia"]): string {
  switch (fechaFin.tipo) {
    case "fecha_exacta":
      return fechaFin.fechaExacta ? formatearFechaParaPrompt(fechaFin.fechaExacta) : "[FECHA NO ESPECIFICADA]";
    case "indefinido":
      return "INDEFINIDO (por tiempo indeterminado)";
    case "hasta_terminar":
      return "HASTA TERMINAR LA PRESTACIÓN/ENTREGA";
    case "personalizado":
      return fechaFin.textoPersonalizado || "[ESPECIFICAR]";
    default:
      return "[NO DEFINIDA]";
  }
}

function formatearMonto(monto: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(monto);
}

// ============================================================================
// PARSER DE RESPUESTA IA
// ============================================================================

export function parseAIResponse(rawContent: string): ContractGenerated {
  let parsed: unknown;

  try {
    // Parseo tolerante: fences, comillas faltantes, saltos literales, etc.
    parsed = parseJsonLenient(rawContent);
  } catch (e) {
    throw new Error(
      `La IA no devolvió JSON válido: ${(e as Error).message}\nPrimeros 500 chars: ${rawContent.slice(0, 500)}`
    );
  }

  // Validar estructura básica
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Respuesta IA no es un objeto");
  }

  const obj = parsed as Record<string, unknown>;

  // Metadatos que a veces omite el modelo: los completamos aquí
  if (!obj.generadoEn || typeof obj.generadoEn !== "string") {
    obj.generadoEn = new Date().toISOString();
  }
  if (!obj.modeloUsado || typeof obj.modeloUsado !== "string") {
    obj.modeloUsado = process.env.GEMINI_MODEL || process.env.OPENROUTER_MODEL || "ia";
  }
  if (!Array.isArray(obj.warnings)) {
    obj.warnings = [];
  }

  // Validar campos obligatorios
  const requiredFields = [
    "tipoContrato", "titulo", "terminologia", "declaraciones",
    "clausulas", "firma", "generadoEn", "modeloUsado"
  ];

  for (const field of requiredFields) {
    if (!(field in obj)) {
      throw new Error(`Campo obligatorio faltante en respuesta IA: ${field}`);
    }
  }

  // Validar cláusulas mínimo
  const clausulas = obj.clausulas as unknown[];
  if (!Array.isArray(clausulas) || clausulas.length < 6) {
    throw new Error(`Mínimo 6 cláusulas requeridas, recibidas: ${clausulas?.length || 0}`);
  }

  // Validar declaraciones
  const decl = obj.declaraciones as Record<string, unknown>;
  if (!Array.isArray(decl?.parteA) || !Array.isArray(decl?.parteB)) {
    throw new Error("Declaraciones inválidas");
  }

  // Validar firma
  const firma = obj.firma as Record<string, unknown>;
  if (!firma?.ciudad || !firma?.fechaEnLetras || !firma?.leyendaCompleta) {
    throw new Error("Firma incompleta");
  }

  return parsed as ContractGenerated;
}

// ============================================================================
// BUILDER PARA PULIR CLÁUSULA USUARIO
// ============================================================================

export function buildPolishClausePrompt(
  clausulaTexto: string,
  contexto: {
    tipoContrato: TipoContrato;
    parteA: string;
    parteB: string;
    objetoDescripcion: string;
  }
): string {
  const terminologia = TERMINOLOGIA_POR_TIPO[contexto.tipoContrato];

  return `CONTEXTO DEL CONTRATO:
- Tipo: ${contexto.tipoContrato}
- ${terminologia.parteA}: ${contexto.parteA}
- ${terminologia.parteB}: ${contexto.parteB}
- Objeto: ${contexto.objetoDescripcion}

CLÁUSULA QUE EL USUARIO ESCRIBIÓ (texto original, tono coloquial):
"${clausulaTexto}"

TAREA: Reescribe esta cláusula dándole tono jurídico profesional mexicano, manteniendo EXACTAMENTE el mismo sentido y obligaciones que el usuario quiso expresar. Usa **negritas** para conceptos clave. Entrega SOLO JSON.`;
}

// ============================================================================
// VALIDADOR POST-GENERACIÓN
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateGeneratedContract(contract: ContractGenerated, input: ContractInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Verificar tipo coincide
  if (contract.tipoContrato !== input.tipoContrato) {
    errors.push(`Tipo de contrato no coincide: esperado ${input.tipoContrato}, recibido ${contract.tipoContrato}`);
  }

  // 2. Verificar terminología
  const terminologiaEsperada = TERMINOLOGIA_POR_TIPO[input.tipoContrato];
  if (contract.terminologia.parteA !== terminologiaEsperada.parteA ||
      contract.terminologia.parteB !== terminologiaEsperada.parteB) {
    warnings.push("Terminología de partes no coincide con el tipo de contrato estándar");
  }

  // 3. Verificar cláusulas obligatorias presentes
  const clausulasObligatorias = CLAUSULAS_OBLIGATORIAS_POR_TIPO[input.tipoContrato];
  const titulosGenerados = contract.clausulas.map(c => c.titulo.toUpperCase());
  
  for (const obligatoria of clausulasObligatorias) {
    const encontrada = titulosGenerados.some(t => t.includes(obligatoria.toUpperCase()));
    if (!encontrada) {
      errors.push(`Cláusula obligatoria faltante: ${obligatoria}`);
    }
  }

  // 4. Verificar que cláusulas usuario estén integradas
  const clausulasUsuario = input.clausulasUsuario.filter(c => c.textoOriginal.trim().length > 0);
  if (clausulasUsuario.length > 0) {
    const integrada = contract.clausulas.some(c => c.fuente === "ia-usuario" || c.fuente === "usuario");
    if (!integrada) {
      warnings.push("Las cláusulas del usuario no parecen estar integradas en el contrato generado");
    }
  }

  // 5. Verificar montos en cláusula de precio
  const clausulaPrecio = contract.clausulas.find(c => 
    c.titulo.toUpperCase().includes("PRECIO") || 
    c.titulo.toUpperCase().includes("RENTA") || 
    c.titulo.toUpperCase().includes("HONORARIO")
  );
  if (clausulaPrecio) {
    const montoStr = input.montoTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 });
    if (!clausulaPrecio.contenido.includes(montoStr) && 
        !clausulaPrecio.contenido.includes(input.montoTotal.toString())) {
      warnings.push("El monto total no aparece explícitamente en la cláusula de precio");
    }
  }

  // 6. Verificar jurisdicción en cláusula correspondiente
  const clausulaJur = contract.clausulas.find(c => 
    c.titulo.toUpperCase().includes("JURISDICCIÓN") || 
    c.titulo.toUpperCase().includes("FUERO") ||
    c.titulo.toUpperCase().includes("LEY APLICABLE")
  );
  if (clausulaJur && !clausulaJur.contenido.includes(input.jurisdiccion)) {
    warnings.push(`La jurisdicción "${input.jurisdiccion}" no aparece en la cláusula de jurisdicción`);
  }

  // 7. Verificar fechas en cláusula de vigencia/entrega
  const clausulaVigencia = contract.clausulas.find(c => 
    c.titulo.toUpperCase().includes("VIGENCIA") || 
    c.titulo.toUpperCase().includes("PLAZO") ||
    c.titulo.toUpperCase().includes("ENTREGA")
  );
  if (clausulaVigencia) {
    // Al menos debería mencionar fecha inicio
    if (!clausulaVigencia.contenido.includes(input.fechaInicioVigencia.split("-")[0])) {
      warnings.push("La fecha de inicio de vigencia no aparece en cláusulas relevantes");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}