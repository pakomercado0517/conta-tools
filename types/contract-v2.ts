import { z } from "zod";

// ============================================================================
// TIPOS BASE Y ENUMS
// ============================================================================

export const TipoContratoEnum = z.enum([
  "venta",
  "arrendamiento",
  "servicios",
  "obra",
  "mandato",
  "personalizado",
]);

export type TipoContrato = z.infer<typeof TipoContratoEnum>;

export const TipoPagoEnum = z.enum([
  "una_exhibicion",
  "parcialidades",
  "otro",
]);

export type TipoPago = z.infer<typeof TipoPagoEnum>;

export const IVAEnum = z.enum([
  "incluido",
  "separado",
  "exento",
]);

export type IVAOption = z.infer<typeof IVAEnum>;

export const FechaFinTipoEnum = z.enum([
  "fecha_exacta",
  "indefinido",
  "hasta_terminar",
  "personalizado",
]);

export type FechaFinTipo = z.infer<typeof FechaFinTipoEnum>;

export const TerminologiaPartesSchema = z.object({
  parteA: z.string().min(1), // "EL VENDEDOR", "EL ARRENDADOR", etc.
  parteB: z.string().min(1), // "EL COMPRADOR", "EL ARRENDATARIO", etc.
  objeto: z.string().min(1), // "bien", "inmueble", "servicios", "obra", "mandato"
});

export type TerminologiaPartes = z.infer<typeof TerminologiaPartesSchema>;

// ============================================================================
// ESQUEMA DE ENTRADA (LO QUE PIDES AL USUARIO)
// ============================================================================

export const ParteSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(200, "Máximo 200 caracteres")
    .trim(),
  esEmpresa: z.boolean().default(false),
  representante: z
    .string()
    .max(200, "Máximo 200 caracteres")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  domicilio: z
    .string()
    .min(10, "El domicilio debe tener al menos 10 caracteres")
    .max(500, "Máximo 500 caracteres")
    .trim(),
});

export type Parte = z.infer<typeof ParteSchema>;

export const FechaFinVigenciaSchema = z.object({
  tipo: FechaFinTipoEnum,
  fechaExacta: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val))
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), "Formato de fecha inválido (YYYY-MM-DD)")
    .refine((val) => !val || !isNaN(Date.parse(val)), "Fecha inválida"),
  textoPersonalizado: z
    .string()
    .max(200, "Máximo 200 caracteres")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
}).refine(
  (data) => {
    if (data.tipo === "fecha_exacta") {
      return data.fechaExacta && !isNaN(Date.parse(data.fechaExacta));
    }
    if (data.tipo === "personalizado") {
      return data.textoPersonalizado && data.textoPersonalizado.trim().length > 0;
    }
    return true;
  },
  {
    message: "Fecha de fin inválida o texto personalizado requerido",
    path: ["fechaExacta"],
  }
);

export type FechaFinVigencia = z.infer<typeof FechaFinVigenciaSchema>;

export const ClausulaUsuarioSchema = z.object({
  id: z.string().uuid(),
  textoOriginal: z.string().min(10, "La cláusula debe tener al menos 10 caracteres").max(2000),
  textoPulido: z.string().max(3000).optional(), // Resultado de IA
  orden: z.number().int().min(0),
  pulida: z.boolean().default(false),
});

export type ClausulaUsuario = z.infer<typeof ClausulaUsuarioSchema>;

export const ClausulasEstandarSeleccionadasSchema = z.object({
  responsabilidadLaboral: z.boolean().default(true),
  facturacionFiscal: z.boolean().default(true),
  confidencialidad: z.boolean().default(true),
  penalizaciones: z.boolean().default(true),
  fuerzaMayor: z.boolean().default(true),
  terminacionAnticipada: z.boolean().default(true),
  notificaciones: z.boolean().default(true),
  noCompetencia: z.boolean().default(false),
  propiedadIntelectual: z.boolean().default(false),
});

export type ClausulasEstandarSeleccionadas = z.infer<typeof ClausulasEstandarSeleccionadasSchema>;

export const FirmasSchema = z.object({
  imagenA: z.string().optional(), // base64 data URL
  imagenB: z.string().optional(),
  textoFirmaA: z.string().max(200).optional().transform((val) => (val === "" ? undefined : val)),
  textoFirmaB: z.string().max(200).optional().transform((val) => (val === "" ? undefined : val)),
});

export type Firmas = z.infer<typeof FirmasSchema>;

export const ContractInputSchema = z.object({
  // Tipo de contrato
  tipoContrato: TipoContratoEnum,

  // Partes
  parteA: ParteSchema,
  parteB: ParteSchema,

  // Objeto
  objetoDescripcion: z
    .string()
    .min(20, "Describe el objeto con al menos 20 caracteres")
    .max(3000, "Máximo 3000 caracteres")
    .trim(),

  // Fechas
  fechaElaboracion: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
    .refine((date) => !isNaN(Date.parse(date)), "Fecha de elaboración inválida"),
  fechaInicioVigencia: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
    .refine((date) => !isNaN(Date.parse(date)), "Fecha de inicio de vigencia inválida"),
  fechaFinVigencia: FechaFinVigenciaSchema,

  // Pago
  montoTotal: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .refine((val) => val > 0, "El monto debe ser mayor a 0")
    .refine((val) => val <= 999999999, "Monto demasiado grande"),
  iva: IVAEnum.default("incluido"),
  tipoPago: TipoPagoEnum.default("una_exhibicion"),
  condicionesPago: z
    .string()
    .max(1000, "Máximo 1000 caracteres")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  metodoPago: z
    .string()
    .max(200, "Máximo 200 caracteres")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),

  // Jurisdicción
  jurisdiccion: z
    .string()
    .min(3, "La jurisdicción debe tener al menos 3 caracteres")
    .max(100, "Máximo 100 caracteres")
    .trim(),

  // Cláusulas
  clausulasUsuario: z.array(ClausulaUsuarioSchema).default([]),
  clausulasEstandar: ClausulasEstandarSeleccionadasSchema.default(() => ({
    responsabilidadLaboral: true,
    facturacionFiscal: true,
    confidencialidad: true,
    penalizaciones: true,
    fuerzaMayor: true,
    terminacionAnticipada: true,
    notificaciones: true,
    noCompetencia: false,
    propiedadIntelectual: false,
  })),

  // Firmas
  firmas: FirmasSchema.default(() => ({
    imagenA: undefined,
    imagenB: undefined,
    textoFirmaA: undefined,
    textoFirmaB: undefined,
  })),

  // Metadatos
  creadoEn: z.string().datetime().optional(),
  actualizadoEn: z.string().datetime().optional(),
}).refine(
  (data) => {
    // Validación cruzada: si tipoPago es parcialidades u otro, condicionesPago es requerido
    if ((data.tipoPago === "parcialidades" || data.tipoPago === "otro") && !data.condicionesPago) {
      return false;
    }
    return true;
  },
  {
    message: "Las condiciones de pago son requeridas para pagos en parcialidades u otro tipo",
    path: ["condicionesPago"],
  }
).refine(
  (data) => {
    // Validación: fecha inicio no posterior a fecha elaboración (opcional, solo warning)
    const inicio = new Date(data.fechaInicioVigencia);
    const elaboracion = new Date(data.fechaElaboracion);
    return inicio >= elaboracion;
  },
  {
    message: "La fecha de inicio de vigencia no debería ser anterior a la fecha de elaboración",
    path: ["fechaInicioVigencia"],
  }
).refine(
  (data) => {
    // Validación: si fecha fin es fecha_exacta, no anterior a inicio
    if (data.fechaFinVigencia.tipo === "fecha_exacta" && data.fechaFinVigencia.fechaExacta) {
      const fin = new Date(data.fechaFinVigencia.fechaExacta);
      const inicio = new Date(data.fechaInicioVigencia);
      return fin >= inicio;
    }
    return true;
  },
  {
    message: "La fecha de fin no puede ser anterior a la fecha de inicio",
    path: ["fechaFinVigencia", "fechaExacta"],
  }
);

export type ContractInput = z.infer<typeof ContractInputSchema>;

// ============================================================================
// ESQUEMA GENERADO POR IA (ESTRUCTURA DEL CONTRATO)
// ============================================================================

export const DeclaracionSchema = z.object({
  parte: z.enum(["A", "B"]),
  items: z.array(z.string().min(1)).min(1),
});

export type Declaracion = z.infer<typeof DeclaracionSchema>;

export const ContractClauseSchema = z.object({
  numero: z.number().int().positive(),
  numeroRomano: z.string().min(1), // "PRIMERA", "SEGUNDA", etc.
  titulo: z.string().min(1).max(100),
  contenido: z.string().min(1).max(5000), // Con markdown **negritas**
  esObligatoria: z.boolean().default(true),
  fuente: z.enum(["ia-estandar", "ia-usuario", "usuario"]).default("ia-estandar"),
});

export type ContractClause = z.infer<typeof ContractClauseSchema>;

export const FirmaGeneradaSchema = z.object({
  ciudad: z.string().min(1),
  fechaEnLetras: z.string().min(1), // "veinticinco de septiembre de dos mil veintiséis"
  leyendaCompleta: z.string().min(1),
});

export type FirmaGenerada = z.infer<typeof FirmaGeneradaSchema>;

export const ContractGeneratedSchema = z.object({
  // Metadatos
  tipoContrato: TipoContratoEnum,
  titulo: z.string().min(1).max(200),
  terminologia: TerminologiaPartesSchema,

  // Declaraciones
  declaraciones: z.object({
    parteA: z.array(z.string().min(1)).min(1),
    parteB: z.array(z.string().min(1)).min(1),
  }),

  // Cláusulas
  clausulas: z.array(ContractClauseSchema).min(6).max(20),

  // Firma
  firma: FirmaGeneradaSchema,

  // Metadatos de generación
  generadoEn: z.string().datetime(),
  modeloUsado: z.string(),
  tokensUsados: z.number().optional(),
  warnings: z.array(z.string()).default([]),
});

export type ContractGenerated = z.infer<typeof ContractGeneratedSchema>;

// ============================================================================
// ESQUEMA FINAL (UNIÓN INPUT + GENERADO + FIRMAS USUARIO)
// ============================================================================

export const ContractFinalSchema = z.object({
  // Input original del usuario
  input: ContractInputSchema,

  // Contrato generado por IA
  generated: ContractGeneratedSchema,

  // Estado
  estado: z.enum(["borrador", "generado", "preview", "pdf_descargado", "firmado"]).default("borrador"),
  version: z.number().int().positive().default(1),

  // Timestamps
  creadoEn: z.string().datetime(),
  actualizadoEn: z.string().datetime(),
  generadoEn: z.string().datetime().optional(),
});

export type ContractFinal = z.infer<typeof ContractFinalSchema>;

// ============================================================================
// ESQUEMAS PARA API
// ============================================================================

export const GenerateContractRequestSchema = z.object({
  input: ContractInputSchema,
  stream: z.boolean().default(true),
  userClauses: z.array(z.string()).optional(), // Cláusulas extra solo texto
});

export type GenerateContractRequest = z.infer<typeof GenerateContractRequestSchema>;

export const PolishClauseRequestSchema = z.object({
  clausulaTexto: z.string().min(10).max(2000),
  contextoContrato: z.object({
    tipoContrato: TipoContratoEnum,
    parteA: z.string(),
    parteB: z.string(),
    objetoDescripcion: z.string(),
  }),
});

export type PolishClauseRequest = z.infer<typeof PolishClauseRequestSchema>;

export const PolishClauseResponseSchema = z.object({
  textoPulido: z.string().min(1).max(3000),
  cambiosPrincipales: z.array(z.string()).optional(),
});

export type PolishClauseResponse = z.infer<typeof PolishClauseResponseSchema>;

// ============================================================================
// TIPOS PARA PDF (DATOS PREPARADOS PARA RENDER)
// ============================================================================

export const ContractPDFDataSchema = z.object({
  titulo: z.string(),
  preambulo: z.string(),
  declaraciones: z.object({
    parteA: z.array(z.string()),
    parteB: z.array(z.string()),
  }),
  clausulas: z.array(z.object({
    numeroRomano: z.string(),
    titulo: z.string(),
    contenido: z.string(), // Con markdown **negritas**
  })),
  firma: z.object({
    ciudad: z.string(),
    fechaEnLetras: z.string(),
    leyendaCompleta: z.string(),
    nombreA: z.string(),
    nombreB: z.string(),
    representanteA: z.string().optional(),
    representanteB: z.string().optional(),
    imagenA: z.string().optional(),
    imagenB: z.string().optional(),
    textoFirmaA: z.string().optional(),
    textoFirmaB: z.string().optional(),
  }),
});

export type ContractPDFData = z.infer<typeof ContractPDFDataSchema>;

// ============================================================================
// HELPERS DE VALIDACIÓN
// ============================================================================

export function validateContractInput(data: unknown): { success: true; data: ContractInput } | { success: false; errors: z.ZodError } {
  const result = ContractInputSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateContractGenerated(data: unknown): { success: true; data: ContractGenerated } | { success: false; errors: z.ZodError } {
  const result = ContractGeneratedSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// ============================================================================
// CONSTANTES ÚTILES
// ============================================================================

export const NUMEROS_ROMANOS = [
  "", "PRIMERA", "SEGUNDA", "TERCERA", "CUARTA", "QUINTA",
  "SEXTA", "SÉPTIMA", "OCTAVA", "NOVENA", "DÉCIMA",
  "DÉCIMA PRIMERA", "DÉCIMA SEGUNDA", "DÉCIMA TERCERA",
  "DÉCIMA CUARTA", "DÉCIMA QUINTA",
] as const;

export function numeroARomano(n: number): string {
  if (n >= 1 && n < NUMEROS_ROMANOS.length) {
    return NUMEROS_ROMANOS[n];
  }
  return `CLÁUSULA ${n}`;
}

export const TERMINOLOGIA_POR_TIPO: Record<TipoContrato, TerminologiaPartes> = {
  venta: { parteA: "EL VENDEDOR", parteB: "EL COMPRADOR", objeto: "bien" },
  arrendamiento: { parteA: "EL ARRENDADOR", parteB: "EL ARRENDATARIO", objeto: "inmueble" },
  servicios: { parteA: "EL PRESTADOR", parteB: "EL CLIENTE", objeto: "servicios" },
  obra: { parteA: "EL CONTRATISTA", parteB: "EL COMITENTE", objeto: "obra" },
  mandato: { parteA: "EL MANDANTE", parteB: "EL MANDATARIO", objeto: "mandato" },
  personalizado: { parteA: "LA PRIMERA PARTE", parteB: "LA SEGUNDA PARTE", objeto: "objeto" },
};

export const CLAUSULAS_OBLIGATORIAS_POR_TIPO: Record<TipoContrato, string[]> = {
  venta: ["OBJETO", "PRECIO Y FORMA DE PAGO", "ENTREGA", "GARANTÍAS", "RESPONSABILIDAD LABORAL", "FACTURACIÓN", "JURISDICCIÓN"],
  arrendamiento: ["OBJETO", "RENTA Y FORMA DE PAGO", "ENTREGA DEL INMUEBLE", "OBLIGACIONES DEL ARRENDADOR", "OBLIGACIONES DEL ARRENDATARIO", "RESPONSABILIDAD LABORAL", "FACTURACIÓN", "JURISDICCIÓN"],
  servicios: ["OBJETO", "HONORARIOS Y FORMA DE PAGO", "PRESTACIÓN DE SERVICIOS", "OBLIGACIONES DE LAS PARTES", "CONFIDENCIALIDAD", "RESPONSABILIDAD LABORAL", "FACTURACIÓN", "JURISDICCIÓN"],
  obra: ["OBJETO", "PRECIO Y FORMA DE PAGO", "EJECUCIÓN DE LA OBRA", "PLAZOS Y ENTREGA", "GARANTÍAS", "RESPONSABILIDAD LABORAL", "FACTURACIÓN", "JURISDICCIÓN"],
  mandato: ["OBJETO", "HONORARIOS Y FORMA DE PAGO", "EJECUCIÓN DEL MANDATO", "OBLIGACIONES DEL MANDATARIO", "RENDICIÓN DE CUENTAS", "RESPONSABILIDAD LABORAL", "FACTURACIÓN", "JURISDICCIÓN"],
  personalizado: ["OBJETO", "CONTRAPRESTACIÓN Y FORMA DE PAGO", "EJECUCIÓN", "OBLIGACIONES DE LAS PARTES", "RESPONSABILIDAD LABORAL", "FACTURACIÓN", "JURISDICCIÓN"],
};

// ============================================================================
// TIPOS PARA CHAT INTERACTIVO (FASE 2)
// ============================================================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  operations?: ContractOperation[];
}

export type ContractOperation =
  | { tipo: "ELIMINAR_CLAUSULA"; numeroRomano: string }
  | { tipo: "MODIFICAR_CLAUSULA"; numeroRomano: string; nuevoContenido: string }
  | { tipo: "INSERTAR_CLAUSULA"; despuesDe: string; clausula: Omit<ContractClause, "numero" | "numeroRomano"> }
  | { tipo: "CAMPO_GLOBAL"; campo: "jurisdiccion" | "fechaFin" | "monto" | "iva" | "tipoPago" | "condicionesPago"; valor: unknown }
  | { tipo: "REORDENAR_CLAUSULAS"; orden: string[] }
  | { tipo: "TOGGLE_CLAUSULA_ESTANDAR"; clave: keyof ClausulasEstandarSeleccionadas; activo: boolean };

export interface ChatContractRequest {
  contract: ContractGenerated;
  message: string;
  history: ChatMessage[];
  stream?: boolean;
}

export interface ChatContractResponse {
  operations: ContractOperation[];
  explicacion: string;
  nuevoContrato?: ContractGenerated;
}

export interface ChatContractStreamEvent {
  type: "chunk" | "complete" | "error";
  content?: string;
  operations?: ContractOperation[];
  explicacion?: string;
  error?: string;
  details?: string;
  retryable?: boolean;
}