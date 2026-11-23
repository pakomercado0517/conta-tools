/**
 * Normaliza índices de declaraciones/cláusulas cuando la IA
 * ya incluye prefijos (A., B., I. DECLARA..., PRIMERA.) y el
 * renderizador también los agrega.
 */

const DECLARATION_HEADER_RE =
  /^(?:[IVXLCDM]+\.\s*)?DECLARA\b/i;

/** Prefijos tipo "A. ", "b) ", "1. ", "II. " al inicio del texto */
const LEADING_INDEX_RE =
  /^(?:[A-Za-z][.)]\s*|\d+[.)]\s*|[IVXLCDM]+\.\s*)+/;

export function isDeclarationHeaderItem(text: string): boolean {
  return DECLARATION_HEADER_RE.test(text.trim());
}

export function stripLeadingIndex(text: string): string {
  return text.trim().replace(LEADING_INDEX_RE, "").trim();
}

/**
 * Quita encabezados "I. DECLARA..." y letras/números duplicados
 * para que el renderer pueda numerar limpio (A, B, C...).
 */
export function prepareDeclarationItems(items: string[]): string[] {
  return items
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .filter((item) => !isDeclarationHeaderItem(item))
    .map(stripLeadingIndex)
    .filter(Boolean);
}

/**
 * Evita títulos tipo "PRIMERA. PRIMERA OBJETO" o "PRIMERA. OBJETO"
 * cuando el romano ya se imprime aparte.
 */
export function cleanClauseTitle(numeroRomano: string, titulo: string): string {
  const raw = titulo.trim();
  if (!raw || !numeroRomano) return raw;

  const escaped = numeroRomano.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cleaned = raw
    .replace(new RegExp(`^${escaped}\\s*[.\\-–:]?\\s*`, "i"), "")
    .trim();

  return cleaned || raw;
}

export function indexLetter(index: number): string {
  if (index < 0) return "A";
  if (index < 26) return String.fromCharCode(65 + index);
  // A, B, ... Z, AA, AB...
  let n = index;
  let label = "";
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}
