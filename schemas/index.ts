import { z } from 'zod';

// =====================================
// ESQUEMAS PRINCIPALES DEL PROYECTO
// =====================================

// Esquema para datos de contrato (basado en ContractGeneratorFormWithAI)
export const ContractDataSchema = z.object({
  // Datos básicos (Vendedor = Prestador)
  prestador: z.string()
    .min(1, 'El nombre del vendedor es requerido')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
    
  cliente: z.string()
    .min(1, 'El nombre del cliente es requerido')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
    
  representantePrestador: z.string()
    .max(100, 'Máximo 100 caracteres')
    .optional()
    .transform(val => val === '' ? undefined : val),
    
  representanteCliente: z.string()
    .max(100, 'Máximo 100 caracteres')
    .optional()
    .transform(val => val === '' ? undefined : val),
    
  domicilioPrestador: z.string()
    .min(1, 'El domicilio del vendedor es requerido')
    .trim(),
    
  domicilioCliente: z.string()
    .min(1, 'El domicilio del cliente es requerido')
    .trim(),
    
  // Régimen fiscal
  regimenVendedor: z.enum(['Persona Física', 'Persona Moral', 'Otro'], {
    message: 'Selecciona un régimen válido para el vendedor'
  }),
  
  regimenVendedorCustom: z.string().optional(),
  
  regimenComprador: z.enum(['Persona Física', 'Persona Moral', 'Otro'], {
    message: 'Selecciona un régimen válido para el comprador'
  }),
  
  regimenCompradorCustom: z.string().optional(),
  
  // Tipo de contrato
  tipoProducto: z.enum(['venta', 'servicio'], {
    message: 'Selecciona si es venta o servicio'
  }),
  
  // Objeto del contrato
  servicios: z.string()
    .min(10, 'Describe el objeto del contrato (mínimo 10 caracteres)')
    .max(2000, 'Máximo 2000 caracteres')
    .trim(),
    
  // Fechas
  fechaInicio: z.string()
    .min(1, 'La fecha de inicio es requerida')
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Fecha de inicio inválida'
    }),
    
  fechaTermino: z.string().optional(),
  
  fechaTerminoTexto: z.string().optional(),
  
  fechaFirma: z.string()
    .min(1, 'La fecha de firma es requerida')
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Fecha de firma inválida'
    }),
    
  // Información de pago
  montoTotal: z.string()
    .min(1, 'El monto total es requerido')
    .refine(
      (val) => {
        const cleanValue = val.replace(/[,$\s]/g, '');
        const num = parseFloat(cleanValue);
        return !isNaN(num) && num > 0;
      },
      'Ingresa un monto válido mayor a 0'
    ),
    
  formaPago: z.string()
    .min(1, 'La forma de pago es requerida')
    .max(200, 'Máximo 200 caracteres')
    .trim(),
    
  // Datos bancarios
  banco: z.string()
    .max(100, 'Máximo 100 caracteres')
    .optional()
    .transform(val => val === '' ? undefined : val),
    
  titularCuenta: z.string()
    .max(100, 'Máximo 100 caracteres')
    .optional()
    .transform(val => val === '' ? undefined : val),
    
  numeroCuenta: z.string()
    .regex(/^\d{10,18}$/, 'Número de cuenta debe tener entre 10 y 18 dígitos')
    .optional()
    .transform(val => val === '' ? undefined : val),
    
  clabeInterbancaria: z.string()
    .regex(/^\d{18}$/, 'CLABE debe tener exactamente 18 dígitos')
    .optional()
    .transform(val => val === '' ? undefined : val),
    
  usarNombreVendedorComoTitular: z.boolean()
    .default(false),
    
  // Jurisdicción y firma
  jurisdiccion: z.string()
    .min(1, 'La jurisdicción es requerida')
    .max(200, 'Máximo 200 caracteres')
    .trim(),
    
  ciudadFirma: z.string()
    .min(1, 'La ciudad de firma es requerida')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
    
  // Firmas personalizadas e imágenes
  firmaVendedor: z.string()
    .optional()
    .transform(val => val === '' ? undefined : val),
    
  firmaComprador: z.string()
    .optional()
    .transform(val => val === '' ? undefined : val),
    
  imagenFirmaVendedor: z.string()
    .nullable()
    .optional(),
    
  imagenFirmaComprador: z.string()
    .nullable()
    .optional(),
})
// Validaciones cruzadas
.refine((data) => {
  // Si fechaTermino es "otro", fechaTerminoTexto debe estar presente
  if (data.fechaTermino === "otro") {
    return data.fechaTerminoTexto && data.fechaTerminoTexto.trim().length > 0;
  }
  return true;
}, {
  message: "Especifica la fecha de término personalizada",
  path: ["fechaTerminoTexto"]
})
.refine((data) => {
  // Si se proporciona numeroCuenta, banco es requerido
  if (data.numeroCuenta && data.numeroCuenta.length > 0) {
    return data.banco && data.banco.trim().length > 0;
  }
  return true;
}, {
  message: "Si proporcionas número de cuenta, el banco es requerido",
  path: ["banco"]
})
.refine((data) => {
  // Validar que la fecha de inicio no sea posterior a la fecha de firma
  const fechaInicio = new Date(data.fechaInicio);
  const fechaFirma = new Date(data.fechaFirma);
  return fechaInicio <= fechaFirma;
}, {
  message: "La fecha de inicio no puede ser posterior a la fecha de firma",
  path: ["fechaInicio"]
});

// Tipo TypeScript inferido automáticamente
export type ContractData = z.infer<typeof ContractDataSchema>;

// =====================================
// ESQUEMA PARA USUARIO
// =====================================

export const UserSchema = z.object({
  id: z.string().uuid('ID de usuario inválido'),
  email: z.string().email('Email inválido'),
  name: z.string().optional(),
  created_at: z.string().datetime('Fecha de creación inválida'),
  updated_at: z.string().datetime().optional(),
});

export type User = z.infer<typeof UserSchema>;

// =====================================
// ESQUEMA PARA DATOS DE COTIZACIÓN
// =====================================

export const QuotationDataSchema = z.object({
  id: z.string().uuid().optional(),
  cliente: z.string()
    .min(1, 'El nombre del cliente es requerido')
    .max(100, 'Máximo 100 caracteres'),
    
  proyecto: z.string()
    .min(1, 'El nombre del proyecto es requerido')
    .max(200, 'Máximo 200 caracteres'),
    
  descripcion: z.string()
    .max(1000, 'Máximo 1000 caracteres')
    .optional(),
    
  items: z.array(z.object({
    id: z.string().uuid().optional(),
    concepto: z.string().min(1, 'El concepto es requerido'),
    cantidad: z.number().min(0.01, 'La cantidad debe ser mayor a 0'),
    precio: z.number().min(0.01, 'El precio debe ser mayor a 0'),
    total: z.number().min(0, 'El total no puede ser negativo'),
  })).min(1, 'Debe haber al menos un item en la cotización'),
  
  subtotal: z.number().min(0, 'El subtotal no puede ser negativo'),
  iva: z.number().min(0, 'El IVA no puede ser negativo'),
  total: z.number().min(0, 'El total no puede ser negativo'),
  
  fechaCreacion: z.string().datetime().optional(),
  fechaVencimiento: z.string().datetime().optional(),
  
  estado: z.enum(['borrador', 'enviada', 'aceptada', 'rechazada'])
    .default('borrador'),
});

export type QuotationData = z.infer<typeof QuotationDataSchema>;

// =====================================
// ESQUEMA PARA INFORMACIÓN DE PAYBACK
// =====================================

export const PaybackDataSchema = z.object({
  inversion: z.number()
    .min(0.01, 'La inversión debe ser mayor a 0'),
    
  flujoEfectivoAnual: z.number()
    .min(0.01, 'El flujo de efectivo anual debe ser mayor a 0'),
    
  tasaDescuento: z.number()
    .min(0, 'La tasa de descuento no puede ser negativa')
    .max(1, 'La tasa de descuento no puede ser mayor al 100%'),
    
  periodos: z.number()
    .int('Los períodos deben ser un número entero')
    .min(1, 'Debe haber al menos un período')
    .max(50, 'Máximo 50 períodos'),
});

export type PaybackData = z.infer<typeof PaybackDataSchema>;

// =====================================
// ESQUEMAS DE UTILIDAD GENERAL
// =====================================

// Esquema para respuestas exitosas genéricas
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

// Esquema para respuestas de error genéricas
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.unknown().optional(),
});

// Esquema para respuestas de API genéricas
export const ApiResponseSchema = z.discriminatedUnion('success', [
  SuccessResponseSchema,
  ErrorResponseSchema,
]);

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// =====================================
// EXPORT DEFAULT
// =====================================

const MainSchemas = {
  ContractDataSchema,
  UserSchema,
  QuotationDataSchema,
  PaybackDataSchema,
  SuccessResponseSchema,
  ErrorResponseSchema,
  ApiResponseSchema,
};

export default MainSchemas;
