import { z } from "zod";

// =====================================
// ESQUEMAS PARA API DE GENERADOR IA
// =====================================

// Esquema para request del generador de conceptos
export const GeneratorConceptRequestSchema = z.object({
  prompt: z
    .string()
    .min(5, "El prompt debe tener al menos 5 caracteres")
    .max(2000, "El prompt no puede exceder 2000 caracteres")
    .trim(),
  systemInstruction: z
    .string()
    .min(10, "La instrucción de sistema es demasiado corta")
    .max(4000, "La instrucción de sistema no puede exceder 4000 caracteres")
    .trim()
    .optional(),
});

export type GeneratorConceptRequest = z.infer<
  typeof GeneratorConceptRequestSchema
>;

// Esquema para response del generador IA
export const AIGeneratorResponseSchema = z.object({
  success: z.boolean(),
  data: z.string().optional(),
  error: z.string().optional(),
});

export type AIGeneratorResponse = z.infer<typeof AIGeneratorResponseSchema>;

// =====================================
// ESQUEMAS PARA API DE DEBUG
// =====================================

// Esquema para response de debug
export const DebugResponseSchema = z.object({
  message: z.string(),
  timestamp: z.string(),
  url: z.string(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
});

export type DebugResponse = z.infer<typeof DebugResponseSchema>;

// =====================================
// ESQUEMAS PARA APIs DE AUTENTICACIÓN
// =====================================

// Esquema para request de login
export const LoginRequestSchema = z.object({
  email: z.string().email("Email inválido").min(1, "El email es requerido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede exceder 100 caracteres"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Esquema para request de registro
export const RegisterRequestSchema = z.object({
  email: z.string().email("Email inválido").min(1, "El email es requerido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "La contraseña no puede exceder 100 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una minúscula, una mayúscula y un número"
    ),
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .optional(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// Esquema para request de reset de contraseña
export const ResetPasswordRequestSchema = z.object({
  email: z.string().email("Email inválido").min(1, "El email es requerido"),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

// =====================================
// ESQUEMAS PARA APIs DE CONTRATOS
// =====================================

// Esquema para request de generación de contrato
export const GenerateContractRequestSchema = z.object({
  contractData: z.object({
    prestador: z.string().min(1, "Nombre del prestador requerido"),
    cliente: z.string().min(1, "Nombre del cliente requerido"),
    servicios: z.string().min(10, "Descripción de servicios requerida"),
    montoTotal: z.string().min(1, "Monto total requerido"),
    // ... otros campos según necesidad
  }),
  format: z.enum(["pdf", "html"]).default("pdf"),
});

export type GenerateContractRequest = z.infer<
  typeof GenerateContractRequestSchema
>;

// =====================================
// ESQUEMAS PARA APIs DE COTIZACIÓN
// =====================================

// Esquema para request de crear cotización
export const CreateQuotationRequestSchema = z.object({
  cliente: z
    .string()
    .min(1, "Nombre del cliente requerido")
    .max(100, "Máximo 100 caracteres"),
  proyecto: z
    .string()
    .min(1, "Nombre del proyecto requerido")
    .max(200, "Máximo 200 caracteres"),
  items: z
    .array(
      z.object({
        concepto: z.string().min(1, "Concepto requerido"),
        cantidad: z.number().min(0.01, "Cantidad debe ser mayor a 0"),
        precio: z.number().min(0.01, "Precio debe ser mayor a 0"),
      })
    )
    .min(1, "Al menos un item es requerido"),
  descripcion: z.string().max(1000, "Máximo 1000 caracteres").optional(),
});

export type CreateQuotationRequest = z.infer<
  typeof CreateQuotationRequestSchema
>;

// Esquema para response de cotización creada
export const QuotationCreatedResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    cliente: z.string(),
    proyecto: z.string(),
    total: z.number(),
    estado: z.string(),
    fechaCreacion: z.string(),
  }),
});

export type QuotationCreatedResponse = z.infer<
  typeof QuotationCreatedResponseSchema
>;

// =====================================
// ESQUEMAS PARA APIs DE ARCHIVOS
// =====================================

// Esquema para request de upload de archivos
export const FileUploadRequestSchema = z.object({
  file: z.instanceof(File, { message: "Archivo requerido" }),
  type: z.enum(["image", "pdf", "document"]),
  maxSize: z
    .number()
    .max(10 * 1024 * 1024, "Archivo muy grande (máx 10MB)")
    .optional(),
});

export type FileUploadRequest = z.infer<typeof FileUploadRequestSchema>;

// Esquema para response de archivo subido
export const FileUploadResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    filename: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string(),
  }),
});

export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;

// =====================================
// ESQUEMAS GENÉRICOS DE ERROR
// =====================================

// Esquema para errores de validación
export const ValidationErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    )
    .optional(),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;

// Esquema para errores de servidor
export const ServerErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.number().optional(),
  timestamp: z.string().optional(),
});

export type ServerError = z.infer<typeof ServerErrorSchema>;

// =====================================
// ESQUEMAS PARA PAGINACIÓN
// =====================================

// Esquema para parámetros de paginación
export const PaginationParamsSchema = z.object({
  page: z.number().int().min(1, "La página debe ser mayor a 0").default(1),
  limit: z
    .number()
    .int()
    .min(1, "El límite debe ser mayor a 0")
    .max(100, "Máximo 100 items por página")
    .default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

// Esquema para respuesta paginada
export const PaginatedResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(z.unknown()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>;

// =====================================
// EXPORT DEFAULT
// =====================================

const ApiSchemas = {
  // AI Generator
  GeneratorConceptRequestSchema,
  AIGeneratorResponseSchema,

  // Debug
  DebugResponseSchema,

  // Auth
  LoginRequestSchema,
  RegisterRequestSchema,
  ResetPasswordRequestSchema,

  // Contratos
  GenerateContractRequestSchema,

  // Cotizaciones
  CreateQuotationRequestSchema,
  QuotationCreatedResponseSchema,

  // Files
  FileUploadRequestSchema,
  FileUploadResponseSchema,

  // Errors
  ValidationErrorSchema,
  ServerErrorSchema,

  // Pagination
  PaginationParamsSchema,
  PaginatedResponseSchema,
};

export default ApiSchemas;
