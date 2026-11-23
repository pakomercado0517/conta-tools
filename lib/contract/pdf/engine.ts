import { jsPDF } from "jspdf";
import {
  ensureJsPdfUnicodeFont,
  setJsPdfUnicodeFont,
} from "@/lib/jspdfUnicodeFont";
import type { ContractGenerated, ContractInput } from "@/types/contract-v2";
import {
  CLAUSE_TITLE_GAP_MM,
  FOOTER_COLOR,
  LINE_HEIGHT_FACTOR,
  PARAGRAPH_GAP_MM,
  PDF_PAGE,
  PDF_TYPE,
  SECTION_GAP_MM,
  lineHeightMm,
  ptToMm,
  usableWidthMm,
} from "./layout";
import { prepareContractDocument, type PreparedContractDocument, type SignaturePartyBlock } from "./prepare";

type FontStyle = "normal" | "bold";
type AlignMode = "left" | "center" | "justify";

type TextToken = { text: string; style: FontStyle };

type WriteOptions = {
  fontSize?: number;
  bold?: boolean;
  align?: AlignMode;
  gapAfter?: number;
  /** Espacio mínimo que debe quedar junto con este bloque (anti-huérfanos) */
  keepWithNextMm?: number;
  /** Si true, no hace addPage (el llamador ya reservó el bloque entero) */
  skipPageBreak?: boolean;
};

/**
 * Motor de maquetación contractual con jsPDF (letter, mm, Noto Sans).
 */
export class ContractPdfEngine {
  private doc: jsPDF;
  private y: number;
  private readonly pageWidth: number;
  private readonly pageHeight: number;
  private readonly contentWidth: number;
  private readonly contentBottom: number;

  private constructor(doc: jsPDF) {
    this.doc = doc;
    this.pageWidth = doc.internal.pageSize.getWidth();
    this.pageHeight = doc.internal.pageSize.getHeight();
    this.contentWidth = usableWidthMm(this.pageWidth);
    this.contentBottom = this.pageHeight - PDF_PAGE.marginBottom;
    this.y = PDF_PAGE.marginTop;
  }

  static async create(): Promise<ContractPdfEngine> {
    const doc = new jsPDF({
      orientation: PDF_PAGE.orientation,
      unit: PDF_PAGE.unit,
      format: PDF_PAGE.format,
    });
    await ensureJsPdfUnicodeFont(doc);
    setJsPdfUnicodeFont(doc, "normal");
    return new ContractPdfEngine(doc);
  }

  getDocument(): jsPDF {
    return this.doc;
  }

  private measure(text: string, style: FontStyle, fontSize: number): number {
    this.doc.setFontSize(fontSize);
    setJsPdfUnicodeFont(this.doc, style);
    return this.doc.getTextWidth(text);
  }

  private ensureSpace(neededMm: number): void {
    if (this.y + neededMm > this.contentBottom) {
      this.doc.addPage();
      this.y = PDF_PAGE.marginTop;
    }
  }

  private tokenizeParagraph(paragraph: string, defaultStyle: FontStyle): TextToken[] {
    const parts = paragraph.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    const tokens: TextToken[] = [];

    parts.forEach((part, idx) => {
      const isBold = part.startsWith("**") && part.endsWith("**");
      let clean = isBold ? part.slice(2, -2) : part;

      if (isBold) {
        const prev = idx > 0 ? parts[idx - 1] : null;
        const next = idx < parts.length - 1 ? parts[idx + 1] : null;
        if (prev && !/\s$/.test(prev) && !/^\s/.test(clean)) clean = ` ${clean}`;
        if (next && !/^\s/.test(next) && !/\s$/.test(clean)) clean = `${clean} `;
      }

      clean.split(/(\s+)/).forEach((word) => {
        if (word.length > 0) {
          tokens.push({ text: word, style: isBold ? "bold" : defaultStyle });
        }
      });
    });

    if (tokens.length === 0) tokens.push({ text: "", style: defaultStyle });
    return tokens;
  }

  private wrapTokens(
    tokens: TextToken[],
    fontSize: number
  ): TextToken[][] {
    const lines: TextToken[][] = [];
    let current: TextToken[] = [];
    let width = 0;

    tokens.forEach((tok) => {
      const w = this.measure(tok.text, tok.style, fontSize);
      if (width + w > this.contentWidth && current.length > 0) {
        lines.push(current);
        current = [tok];
        width = w;
      } else {
        current.push(tok);
        width += w;
      }
    });
    if (current.length > 0) lines.push(current);
    return lines;
  }

  private renderLine(
    lineTokens: TextToken[],
    fontSize: number,
    align: AlignMode,
    isLastLine: boolean
  ): void {
    const wordTokens = lineTokens.filter((t) => !/^\s+$/.test(t.text));
    const wordsWidth = wordTokens.reduce(
      (sum, t) => sum + this.measure(t.text, t.style, fontSize),
      0
    );

    let x = PDF_PAGE.marginLeft;
    let extraGap = 0;

    if (align === "center") {
      const fullWidth = lineTokens.reduce(
        (sum, t) => sum + this.measure(t.text, t.style, fontSize),
        0
      );
      x = PDF_PAGE.marginLeft + (this.contentWidth - fullWidth) / 2;
    } else if (align === "justify" && !isLastLine && wordTokens.length > 1) {
      extraGap = (this.contentWidth - wordsWidth) / (wordTokens.length - 1);
    }

    let wordIndex = 0;
    lineTokens.forEach((t) => {
      const isSpace = /^\s+$/.test(t.text);
      const tw = this.measure(t.text, t.style, fontSize);

      if (!isSpace) {
        this.doc.setFontSize(fontSize);
        setJsPdfUnicodeFont(this.doc, t.style);
        this.doc.text(t.text, x, this.y);
        x += tw;
        wordIndex += 1;
        if (align === "justify" && !isLastLine && wordIndex < wordTokens.length) {
          x += extraGap;
        }
      } else if (align !== "justify" || isLastLine) {
        this.doc.setFontSize(fontSize);
        setJsPdfUnicodeFont(this.doc, t.style);
        this.doc.text(t.text, x, this.y);
        x += tw;
      }
    });
  }

  private estimateBlockHeight(text: string, fontSize: number, bold: boolean): number {
    const style: FontStyle = bold ? "bold" : "normal";
    const paragraphs = String(text).split("\n");
    let lines = 0;
    paragraphs.forEach((p) => {
      const tokens = this.tokenizeParagraph(p, style);
      lines += Math.max(1, this.wrapTokens(tokens, fontSize).length);
    });
    return lines * lineHeightMm(fontSize) + PARAGRAPH_GAP_MM * 0.35;
  }

  writeBlock(text: string, options: WriteOptions = {}): void {
    const fontSize = options.fontSize ?? PDF_TYPE.body;
    const bold = options.bold ?? false;
    const align = options.align ?? "justify";
    const gapAfter = options.gapAfter ?? PARAGRAPH_GAP_MM;
    const keepWithNext = options.keepWithNextMm ?? 0;
    const skipPageBreak = options.skipPageBreak ?? false;
    const lh = lineHeightMm(fontSize);
    const estimated = this.estimateBlockHeight(text, fontSize, bold);

    if (!skipPageBreak) {
      this.ensureSpace(estimated + keepWithNext);
    }

    const defaultStyle: FontStyle = bold ? "bold" : "normal";
    const paragraphs = String(text).split("\n");

    paragraphs.forEach((paragraph, pIdx) => {
      const tokens = this.tokenizeParagraph(paragraph, defaultStyle);
      const lines = this.wrapTokens(tokens, fontSize);

      lines.forEach((line, lineIdx) => {
        if (!skipPageBreak) {
          this.ensureSpace(lh);
        }
        this.renderLine(line, fontSize, align, lineIdx === lines.length - 1);
        this.y += lh;
      });

      if (pIdx < paragraphs.length - 1) {
        this.y += lh * 0.35;
      }
    });

    this.y += gapAfter;
  }

  writeSpace(mm: number): void {
    this.y += mm;
  }

  private estimateSignatureColumnHeight(
    party: SignaturePartyBlock,
    colWidth: number
  ): number {
    let h = 8; // título
    h += party.imagen ? 26 : 22; // espacio firma / imagen
    h += 6; // línea

    this.doc.setFontSize(PDF_TYPE.signatureName);
    const nameLines = this.doc.splitTextToSize(
      party.nombre.toUpperCase(),
      colWidth - 6
    ) as string[];
    h += nameLines.length * ptToMm(PDF_TYPE.signatureName) * LINE_HEIGHT_FACTOR + 1.5;

    if (party.representante) {
      this.doc.setFontSize(PDF_TYPE.signatureMeta);
      const repLines = this.doc.splitTextToSize(
        party.representante.toUpperCase(),
        colWidth - 6
      ) as string[];
      h += repLines.length * ptToMm(PDF_TYPE.signatureMeta) * LINE_HEIGHT_FACTOR + 1;
      h += 5; // "Representante Legal"
    }

    if (party.texto) {
      this.doc.setFontSize(PDF_TYPE.signatureMeta);
      const custom = this.doc.splitTextToSize(party.texto, colWidth - 6) as string[];
      h += custom.length * ptToMm(PDF_TYPE.signatureMeta) * LINE_HEIGHT_FACTOR;
    }

    return h + 4;
  }

  private drawSignatureColumn(
    x: number,
    startY: number,
    colWidth: number,
    party: SignaturePartyBlock
  ): number {
    let localY = startY;
    const center = x + colWidth / 2;
    const lineLen = Math.min(70, colWidth - 8);

    this.doc.setFontSize(PDF_TYPE.signatureTitle);
    setJsPdfUnicodeFont(this.doc, "bold");
    this.doc.text(party.titulo.toUpperCase(), center, localY, { align: "center" });
    localY += 8;

    if (party.imagen) {
      try {
        this.doc.addImage(party.imagen, "PNG", center - 22, localY, 44, 22);
        localY += 26;
      } catch {
        localY += 22;
      }
    } else {
      localY += 22;
    }

    this.doc.setDrawColor(40);
    this.doc.setLineWidth(0.25);
    this.doc.line(center - lineLen / 2, localY, center + lineLen / 2, localY);
    localY += 6;

    this.doc.setFontSize(PDF_TYPE.signatureName);
    setJsPdfUnicodeFont(this.doc, "bold");
    const nameLines = this.doc.splitTextToSize(
      party.nombre.toUpperCase(),
      colWidth - 6
    ) as string[];
    this.doc.text(nameLines, center, localY, { align: "center" });
    localY += nameLines.length * ptToMm(PDF_TYPE.signatureName) * LINE_HEIGHT_FACTOR + 1.5;

    if (party.representante) {
      this.doc.setFontSize(PDF_TYPE.signatureMeta);
      setJsPdfUnicodeFont(this.doc, "normal");
      const repLines = this.doc.splitTextToSize(
        party.representante.toUpperCase(),
        colWidth - 6
      ) as string[];
      this.doc.text(repLines, center, localY, { align: "center" });
      localY += repLines.length * ptToMm(PDF_TYPE.signatureMeta) * LINE_HEIGHT_FACTOR + 1;
      this.doc.text("Representante Legal", center, localY, { align: "center" });
      localY += 5;
    }

    if (party.texto) {
      this.doc.setFontSize(PDF_TYPE.signatureMeta);
      setJsPdfUnicodeFont(this.doc, "normal");
      const custom = this.doc.splitTextToSize(party.texto, colWidth - 6) as string[];
      this.doc.text(custom, center, localY, { align: "center" });
      localY += custom.length * ptToMm(PDF_TYPE.signatureMeta) * LINE_HEIGHT_FACTOR;
    }

    return localY;
  }

  /**
   * Cierre + firmas (EL CLIENTE / EL PRESTADOR) como bloque atómico.
   * Si no cabe entero en la página actual → `doc.addPage()` primero,
   * luego se dibuja todo junto en la misma página.
   */
  private renderSignatureBlock(docData: PreparedContractDocument): void {
    const doc = this.doc;
    const gap = 8;
    const colWidth = (this.contentWidth - gap) / 2;
    const leftX = PDF_PAGE.marginLeft;
    const rightX = PDF_PAGE.marginLeft + colWidth + gap;

    const legendHeight = this.estimateBlockHeight(
      docData.leyendaFirma,
      PDF_TYPE.body,
      false
    );
    const columnsHeight = Math.max(
      this.estimateSignatureColumnHeight(docData.firmaIzquierda, colWidth),
      this.estimateSignatureColumnHeight(docData.firmaDerecha, colWidth)
    );
    const totalClosingHeight =
      legendHeight + SECTION_GAP_MM + columnsHeight + 4;

    // Comprobar cabida del bloque completo ANTES de dibujar cualquier elemento
    if (this.y + totalClosingHeight > this.contentBottom) {
      doc.addPage();
      this.y = PDF_PAGE.marginTop;
    }

    // Párrafo de cierre ("Leído que fue el presente Contrato...")
    this.writeBlock(docData.leyendaFirma, {
      fontSize: PDF_TYPE.body,
      align: "justify",
      gapAfter: SECTION_GAP_MM,
      keepWithNextMm: 0,
      skipPageBreak: true,
    });

    // Firmas en dos columnas simétricas (misma Y de inicio)
    const startY = this.y;
    const endLeft = this.drawSignatureColumn(
      leftX,
      startY,
      colWidth,
      docData.firmaIzquierda
    );
    const endRight = this.drawSignatureColumn(
      rightX,
      startY,
      colWidth,
      docData.firmaDerecha
    );
    this.y = Math.max(endLeft, endRight) + 4;
  }

  private paintFooters(): void {
    const total = this.doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(PDF_TYPE.footer);
      setJsPdfUnicodeFont(this.doc, "normal");
      this.doc.setTextColor(...FOOTER_COLOR);
      const label = `Página ${i} de ${total}`;
      this.doc.text(
        label,
        this.pageWidth / 2,
        this.pageHeight - PDF_PAGE.marginBottom / 2,
        { align: "center" }
      );
      this.doc.setTextColor(0, 0, 0);
    }
  }

  render(docData: PreparedContractDocument): jsPDF {
    // Título
    this.writeBlock(docData.titulo, {
      fontSize: PDF_TYPE.title,
      bold: true,
      align: "center",
      gapAfter: SECTION_GAP_MM,
    });

    // Preámbulo
    this.writeBlock(docData.preambulo, {
      fontSize: PDF_TYPE.body,
      align: "justify",
      gapAfter: SECTION_GAP_MM,
    });

    // DECLARACIONES (sección antes de I. / II.)
    this.writeBlock(docData.declaracionesEncabezado, {
      fontSize: PDF_TYPE.section,
      bold: true,
      align: "center",
      gapAfter: SECTION_GAP_MM,
    });

    this.writeBlock(docData.declaracionParteA.encabezado, {
      fontSize: PDF_TYPE.body,
      bold: true,
      align: "left",
      gapAfter: CLAUSE_TITLE_GAP_MM,
    });
    docData.declaracionParteA.items.forEach((item) => {
      this.writeBlock(item, {
        fontSize: PDF_TYPE.body,
        align: "justify",
        gapAfter: 3.5,
      });
    });
    this.writeSpace(2);

    this.writeBlock(docData.declaracionParteB.encabezado, {
      fontSize: PDF_TYPE.body,
      bold: true,
      align: "left",
      gapAfter: CLAUSE_TITLE_GAP_MM,
    });
    docData.declaracionParteB.items.forEach((item) => {
      this.writeBlock(item, {
        fontSize: PDF_TYPE.body,
        align: "justify",
        gapAfter: 3.5,
      });
    });
    this.writeSpace(2);

    this.writeBlock(docData.transicion, {
      fontSize: PDF_TYPE.body,
      align: "justify",
      gapAfter: SECTION_GAP_MM,
    });

    // CLÁUSULAS
    this.writeBlock(docData.clausulasEncabezado, {
      fontSize: PDF_TYPE.section,
      bold: true,
      align: "center",
      gapAfter: SECTION_GAP_MM,
    });

    docData.clausulas.forEach((clausula) => {
      const title = `${clausula.numeroRomano}. ${clausula.titulo}`;
      const bodyEstimate = this.estimateBlockHeight(
        clausula.contenido,
        PDF_TYPE.body,
        false
      );
      // Anti-huérfano: título + al menos ~2-3 líneas de cuerpo
      const minBody = Math.min(bodyEstimate, lineHeightMm(PDF_TYPE.body) * 3 + 2);

      this.writeBlock(title, {
        fontSize: PDF_TYPE.clauseTitle,
        bold: true,
        align: "left",
        gapAfter: CLAUSE_TITLE_GAP_MM,
        keepWithNextMm: minBody,
      });

      this.writeBlock(clausula.contenido, {
        fontSize: PDF_TYPE.body,
        align: "justify",
        gapAfter: SECTION_GAP_MM,
      });
    });

    this.renderSignatureBlock(docData);
    this.paintFooters();
    return this.doc;
  }
}

/**
 * Genera el PDF del contrato (letter, márgenes legales, tipografía uniforme).
 */
export async function generateContractPdf(
  contract: ContractGenerated,
  input: ContractInput
): Promise<jsPDF> {
  const prepared = prepareContractDocument(contract, input);
  const engine = await ContractPdfEngine.create();
  return engine.render(prepared);
}

export function buildContractPdfFileName(
  contract: ContractGenerated,
  input: ContractInput
): string {
  const safe = (value: string) =>
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "")
      .slice(0, 60);

  return `contrato_${safe(contract.tipoContrato)}_${safe(input.parteA.nombre)}_${safe(input.parteB.nombre)}.pdf`;
}
