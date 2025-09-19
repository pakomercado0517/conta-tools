// Declaración de tipos para jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => void;
    previousAutoTable: {
      finalY: number;
    };
  }
}
