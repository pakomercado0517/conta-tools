import { SpecialZoomLevel, Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface PDFPreviewerProps {
  pdfDataUrl: string;
}

export default function PDFPreviewer({ pdfDataUrl }: PDFPreviewerProps) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-gray-200">
        Vista previa del PDF
      </h2>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div className="h-[75vh] min-h-96 overflow-auto rounded-lg border border-gray-700 lg:h-[calc(100vh-7rem)]">
          <Viewer
            fileUrl={pdfDataUrl}
            defaultScale={SpecialZoomLevel.PageWidth}
          />
        </div>
      </Worker>
    </section>
  );
}
