declare module "pdfjs-dist/build/pdf" {
  export const GlobalWorkerOptions: { workerSrc: string };

  export interface TextContent {
    items: Array<{ str?: string }>;
  }

  export interface PdfPage {
    getTextContent(): Promise<TextContent>;
  }

  export interface PdfDocument {
    numPages: number;
    getPage(pageNumber: number): Promise<PdfPage>;
  }

  export function getDocument(options: { data: Uint8Array }): {
    promise: Promise<PdfDocument>;
  };
}
