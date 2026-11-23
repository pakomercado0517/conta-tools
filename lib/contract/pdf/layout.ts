/**
 * Constantes tipográficas y de página para contratos PDF (mm).
 */

export const PDF_PAGE = {
  format: "letter" as const,
  orientation: "portrait" as const,
  unit: "mm" as const,
  /** Márgenes: encuadernación a la izquierda */
  marginTop: 25,
  marginBottom: 25,
  marginRight: 25,
  marginLeft: 30,
} as const;

/** Tamaños en pt (jsPDF setFontSize usa pt aunque la unidad del doc sea mm) */
export const PDF_TYPE = {
  title: 14,
  section: 12,
  clauseTitle: 10.5,
  body: 10,
  footer: 8.5,
  signatureTitle: 10.5,
  signatureName: 9,
  signatureMeta: 7.5,
} as const;

/** Interlineado relativo al tamaño de fuente (pt → mm) */
export const LINE_HEIGHT_FACTOR = 1.4;
export const PARAGRAPH_GAP_MM = 5;
export const SECTION_GAP_MM = 6;
export const CLAUSE_TITLE_GAP_MM = 3;

export const FOOTER_COLOR: [number, number, number] = [120, 120, 120];

/** 1 pt = 25.4/72 mm */
export function ptToMm(pt: number): number {
  return (pt * 25.4) / 72;
}

export function lineHeightMm(fontSizePt: number, factor = LINE_HEIGHT_FACTOR): number {
  return ptToMm(fontSizePt) * factor;
}

export function usableWidthMm(pageWidthMm: number): number {
  return pageWidthMm - PDF_PAGE.marginLeft - PDF_PAGE.marginRight;
}
