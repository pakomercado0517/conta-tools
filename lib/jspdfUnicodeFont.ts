import type { jsPDF } from "jspdf";

/** Familia registrada en jsPDF para caracteres Unicode (½, ², ³, etc.). */
export const JSPDF_UNICODE_FONT = "NotoSans";

const REGULAR_FILE = "NotoSans-Regular.ttf";
const BOLD_FILE = "NotoSans-Bold.ttf";

const fontBinary: { regular?: string; bold?: string } = {};
let loadPromise: Promise<void> | null = null;

function arrayBufferToBinary(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return binary;
}

function getLoadedFontBinaries(): { regular: string; bold: string } {
  const { regular, bold } = fontBinary;
  if (!regular || !bold) {
    throw new Error(
      "Las fuentes del PDF no están cargadas. Llama a ensureJsPdfUnicodeFont después de loadFontBinaries."
    );
  }
  return { regular, bold };
}

async function loadFontBinaries(): Promise<void> {
  if (fontBinary.regular && fontBinary.bold) return;

  if (!loadPromise) {
    loadPromise = (async () => {
      const [regularRes, boldRes] = await Promise.all([
        fetch("/fonts/NotoSans-Regular.ttf"),
        fetch("/fonts/NotoSans-Bold.ttf"),
      ]);

      if (!regularRes.ok || !boldRes.ok) {
        throw new Error(
          "No se pudieron cargar las fuentes del PDF (Noto Sans en /public/fonts)"
        );
      }

      fontBinary.regular = arrayBufferToBinary(await regularRes.arrayBuffer());
      fontBinary.bold = arrayBufferToBinary(await boldRes.arrayBuffer());
    })();
  }

  await loadPromise;
}

function isUnicodeFontOnDoc(doc: jsPDF): boolean {
  const list = doc.getFontList() as Record<string, string[] | undefined>;
  return Boolean(list[JSPDF_UNICODE_FONT]?.length);
}

/**
 * Registra Noto Sans (normal y negrita) en el documento jsPDF.
 * Debe llamarse antes de escribir texto con formatConceptText.
 */
export async function ensureJsPdfUnicodeFont(doc: jsPDF): Promise<void> {
  await loadFontBinaries();

  if (!isUnicodeFontOnDoc(doc)) {
    const { regular, bold } = getLoadedFontBinaries();
    doc.addFileToVFS(REGULAR_FILE, regular);
    doc.addFileToVFS(BOLD_FILE, bold);
    doc.addFont(REGULAR_FILE, JSPDF_UNICODE_FONT, "normal");
    doc.addFont(BOLD_FILE, JSPDF_UNICODE_FONT, "bold");
  }
}

export type JsPdfUnicodeFontStyle = "normal" | "bold" | "italic";

/** Aplica Noto Sans al documento (itálica se aproxima con normal). */
export function setJsPdfUnicodeFont(
  doc: jsPDF,
  style: JsPdfUnicodeFontStyle = "normal"
): void {
  const resolved = style === "bold" ? "bold" : "normal";
  doc.setFont(JSPDF_UNICODE_FONT, resolved);
}

/** Precarga fuentes en segundo plano (cotizaciones / contratos). */
export function preloadJsPdfUnicodeFonts(): void {
  void loadFontBinaries().catch(() => {
    /* El error se mostrará al generar el PDF si falla la carga. */
  });
}
