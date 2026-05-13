// =====================================
// TIPOS PARA COMPONENTES DE COTIZACIÓN
// =====================================

import { ChangeEvent } from "react";

/** Impuesto o retención aplicado a una línea de producto (base = cantidad × precio). */
export type QuotationTaxTipo = "impuesto" | "retencion";

export type QuotationTaxModo = "porcentaje" | "cuota_fija";

export interface QuotationTaxLine {
  etiqueta: string;
  tipo: QuotationTaxTipo;
  modo: QuotationTaxModo;
  /** Porcentaje (ej. 16) o monto fijo en pesos según `modo`. */
  valor: string;
}

// Interfaz para productos en cotización
export interface QuotationProduct {
  cantidad: string | number;
  unidad: string;
  descripcion: string;
  precioUnitario: string | number;
  total: string | number;
  /** Conceptos fiscales opcionales calculados sobre el importe de esta línea. */
  impuestosLinea: QuotationTaxLine[];
}

// Interfaz para datos bancarios
export interface BankData {
  "Nombre del Banco": string;
  "Número de cuenta": string | number;
  "Clabe Interbancaria": string | number;
}

// Interfaz principal para datos de cotización (basado en uso real en QuotationLayout)
export interface QuotationFormData {
  // Información de la empresa
  empresa: string;
  rfc: string;
  telefono: string | number;
  email: string;
  domicilio: string;
  logoEmpresa: string;
  lugar: string;

  // Información del destinatario
  destinatario: string;
  destinatarioEmpresa: string;

  // Fechas
  fecha: string;

  // Productos y servicios
  productos: QuotationProduct[];

  // Clausulas
  clausulas: string[];

  // Textos predefinidos
  despedida: string;
  saludo: string;
  /** Texto opcional tras el saludo en el PDF (multilínea). */
  descripcionServicio: string;
  /** Si es true y hay texto, se incluye en el PDF; si es false, no (el texto puede quedar como borrador). */
  incluirDescripcionServicio: boolean;

  // Información de firma
  firma: string;
  cargo: string;

  /** Etiqueta PDF para la fila de subtotal (editable). */
  etiquetaSubtotal: string;
  /** Etiqueta PDF para la fila de total (editable). */
  etiquetaTotal: string;
  /** Texto previo a la cantidad con letra en el PDF (editable), ej. "Son:" o "Cantidad con letra:". */
  textoCantidadLetra: string;

  // Datos bancarios
  bank: boolean;
}

// Props para componentes de cotización
export interface QuotationFormProps {
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  datos: QuotationFormData;
  agregarLogoEmpresa: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface QuotationRecipientsProps {
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export interface QuotationProductsProps {
  datos: QuotationFormData;
  handleProductoChange: (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => void;
  agregarProducto: () => void;
  eliminarProducto: (index: number) => void;
  agregarImpuestoProducto: (productIndex: number) => void;
  eliminarImpuestoProducto: (productIndex: number, taxIndex: number) => void;
  handleImpuestoProductoChange: (
    productIndex: number,
    taxIndex: number,
    field: keyof QuotationTaxLine,
    value: string
  ) => void;
}

export interface QuotationClausesProps {
  datos: QuotationFormData;
  handleClausulaChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => void;
  agregarClausula: () => void;
  eliminarClausula: (index: number) => void;
}

export interface QuotationDataBankProps {
  handleDataBankChange: (e: ChangeEvent<HTMLInputElement>) => void;
  showDataBank: (e: ChangeEvent<HTMLInputElement>) => void;
  datos: QuotationFormData;
}

export interface QuotationServiceDescriptionProps {
  datos: QuotationFormData;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  toggleIncluirDescripcion: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface QuotationSummaryLabelsProps {
  datos: QuotationFormData;
  onChangeField: (
    field: "etiquetaSubtotal" | "etiquetaTotal" | "textoCantidadLetra",
    value: string
  ) => void;
}

export interface QuotationPDFButtonsProps {
  datos: QuotationFormData;
  setPdfDataUrl: (url: string | null) => void;
  dataBank: BankData | BankData[];
}

// Estado del layout principal
export interface QuotationLayoutState {
  datos: QuotationFormData;
  dataBank: BankData | BankData[];
  pdfDataUrl: string | null;
}

// Tipos para handlers de eventos específicos
export type QuotationChangeHandler = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => void;
export type QuotationProductChangeHandler = (
  e: ChangeEvent<HTMLInputElement>,
  index: number
) => void;
export type QuotationClauseChangeHandler = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  index: number
) => void;
export type QuotationFileHandler = (e: ChangeEvent<HTMLInputElement>) => void;
