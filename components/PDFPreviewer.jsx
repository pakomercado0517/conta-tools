import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

export default function PDFPreviewer({ pdfDataUrl }) {
  return (
    <section className="my-8 h-auto">
      <h2 className="text-lg font-semibold">Vista previa del PDF</h2>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div className="h-96 overflow-auto">
          <Viewer fileUrl={pdfDataUrl} />
        </div>
      </Worker>
    </section>
  );
}
