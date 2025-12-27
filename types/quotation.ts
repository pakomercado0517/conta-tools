// =====================================
// TIPOS PARA COMPONENTES DE COTIZACIÓN
// =====================================

import { ChangeEvent } from "react";

// Interfaz para productos en cotización
export interface QuotationProduct {
  cantidad: string | number;
  unidad: string;
  descripcion: string;
  precioUnitario: string | number;
  total: string | number;
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

  // Información de firma
  firma: string;
  cargo: string;

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
