import { jsPDF } from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

// Extender el tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    previousAutoTable: {
      finalY: number;
    };
  }
}

// Tipos para los datos del PDF
export interface PDFData {
  [key: string]: string | number | undefined;
  total?: number;
}

// Opciones para la configuración del PDF
export interface PDFOptions {
  filename?: string;
  showTotal?: boolean;
  tableOptions?: Partial<UserOptions>;
  pageFormat?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
}

// Configuración por defecto
const DEFAULT_OPTIONS: PDFOptions = {
  filename: 'resultado.pdf',
  showTotal: false,
  pageFormat: 'a4',
  orientation: 'portrait',
};

// Tipos para el valor de retorno del hook
interface UseCreatePDFReturn {
  createDocument: (data: PDFData, options?: PDFOptions) => void;
  createAdvancedDocument: (data: PDFData[], options?: PDFOptions) => void;
  downloadDocument: (data: PDFData, options?: PDFOptions) => void;
}

/**
 * Hook personalizado para crear documentos PDF con jsPDF
 * @returns Objeto con funciones para crear PDFs
 */
export default function useCreatePDF(): UseCreatePDFReturn {
  /**
   * Crea un documento PDF básico con los datos proporcionados
   * @param data - Datos a incluir en el PDF
   * @param options - Opciones de configuración (opcional)
   */
  const createDocument = (data: PDFData, options: PDFOptions = {}): void => {
    const finalOptions = { ...DEFAULT_OPTIONS, ...options };
    const doc = new jsPDF({
      orientation: finalOptions.orientation,
      format: finalOptions.pageFormat
    });

    // Convertir datos a formato de tabla
    const header: string[] = [];
    const tableResults: (string | number)[] = [];
    
    Object.keys(data).forEach((key) => {
      // Excluir la clave 'total' si no se debe mostrar
      if (key === 'total' && !finalOptions.showTotal) return;
      
      header.push(key.toUpperCase());
      const value = data[key];
      tableResults.push(value !== undefined ? value : '');
    });

    // Configuración por defecto de la tabla
    const defaultTableOptions: UserOptions = {
      head: [header],
      body: [tableResults],
      startY: 20,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [63, 136, 197],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      ...finalOptions.tableOptions,
    };

    // Crear la tabla
    autoTable(doc, defaultTableOptions);

    // Agregar total si está especificado
    if (finalOptions.showTotal && data.total !== undefined) {
      const tableHeight = doc.previousAutoTable?.finalY || 50;
      const totalX = 150;
      const totalY = Math.ceil(tableHeight) + 20;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${data.total}`, totalX, totalY);
    }

    // Guardar el documento
    const filename = finalOptions.filename || 'documento.pdf';
    doc.save(filename);
  };

  /**
   * Crea un documento PDF avanzado con múltiples conjuntos de datos
   * @param dataArray - Array de datos a incluir en el PDF
   * @param options - Opciones de configuración (opcional)
   */
  const createAdvancedDocument = (dataArray: PDFData[], options: PDFOptions = {}): void => {
    const finalOptions = { ...DEFAULT_OPTIONS, ...options };
    const doc = new jsPDF({
      orientation: finalOptions.orientation,
      format: finalOptions.pageFormat
    });

    let currentY = 20;

    dataArray.forEach((data, index) => {
      // Agregar título para cada sección
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Sección ${index + 1}`, 20, currentY);
      currentY += 15;

      // Convertir datos a formato de tabla
      const header: string[] = [];
      const tableResults: (string | number)[] = [];
      
      Object.keys(data).forEach((key) => {
        if (key === 'total' && !finalOptions.showTotal) return;
        
        header.push(key.toUpperCase());
        const value = data[key];
        tableResults.push(value !== undefined ? value : '');
      });

      const tableOptions: UserOptions = {
        head: [header],
        body: [tableResults],
        startY: currentY,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [63, 136, 197],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        ...finalOptions.tableOptions,
      };

      autoTable(doc, tableOptions);
      currentY = doc.previousAutoTable?.finalY ? doc.previousAutoTable.finalY + 20 : currentY + 50;

      // Agregar total si está especificado
      if (finalOptions.showTotal && data.total !== undefined) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: ${data.total}`, 150, currentY - 10);
      }

      // Nueva página si no es el último elemento y hay más datos
      if (index < dataArray.length - 1 && currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
    });

    const filename = finalOptions.filename || 'documento-avanzado.pdf';
    doc.save(filename);
  };

  /**
   * Función de conveniencia que combina crear y descargar
   * @param data - Datos a incluir en el PDF
   * @param options - Opciones de configuración (opcional)
   */
  const downloadDocument = (data: PDFData, options: PDFOptions = {}): void => {
    createDocument(data, { ...options, showTotal: true });
  };

  return {
    createDocument,
    createAdvancedDocument,
    downloadDocument,
  };
}

/**
 * Crea un PDF simple directamente sin usar hooks (función utilitaria independiente)
 * @param data - Datos para el PDF
 * @param filename - Nombre del archivo (opcional)
 */
export const createSimplePDF = (data: PDFData, filename: string = 'documento.pdf'): void => {
  const finalOptions = { ...DEFAULT_OPTIONS, filename };
  const doc = new jsPDF({
    orientation: finalOptions.orientation,
    format: finalOptions.pageFormat
  });

  // Convertir datos a formato de tabla
  const header: string[] = [];
  const tableResults: (string | number)[] = [];
  
  Object.keys(data).forEach((key) => {
    header.push(key.toUpperCase());
    const value = data[key];
    tableResults.push(value !== undefined ? value : '');
  });

  const tableOptions: UserOptions = {
    head: [header],
    body: [tableResults],
    startY: 20,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [63, 136, 197],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
  };

  autoTable(doc, tableOptions);
  const saveFilename = finalOptions.filename || 'documento.pdf';
  doc.save(saveFilename);
};

/**
 * Crea un PDF con total directamente sin usar hooks (función utilitaria independiente)
 * @param data - Datos para el PDF (debe incluir campo 'total')
 * @param filename - Nombre del archivo (opcional)
 */
export const createPDFWithTotal = (data: PDFData, filename: string = 'reporte.pdf'): void => {
  const finalOptions = { ...DEFAULT_OPTIONS, filename, showTotal: true };
  const doc = new jsPDF({
    orientation: finalOptions.orientation,
    format: finalOptions.pageFormat
  });

  // Convertir datos a formato de tabla
  const header: string[] = [];
  const tableResults: (string | number)[] = [];
  
  Object.keys(data).forEach((key) => {
    if (key === 'total' && !finalOptions.showTotal) return;
    
    header.push(key.toUpperCase());
    const value = data[key];
    tableResults.push(value !== undefined ? value : '');
  });

  const tableOptions: UserOptions = {
    head: [header],
    body: [tableResults],
    startY: 20,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [63, 136, 197],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
  };

  autoTable(doc, tableOptions);
  
  // Agregar total si está especificado
  if (finalOptions.showTotal && data.total !== undefined) {
    const finalY = doc.previousAutoTable?.finalY || 60;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${data.total}`, 150, finalY + 10);
  }
  
  const saveFilename = finalOptions.filename || 'reporte.pdf';
  doc.save(saveFilename);
};
