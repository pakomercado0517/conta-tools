/**
 * Normalización de texto para contratos PDF (español jurídico).
 */

const DRAFT_MARKER_RE = /\[([^\]]+)\]/g;

/** Comillas tipográficas / huérfanas → ASCII limpio */
function normalizeQuotes(text: string): string {
  return text
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    .replace(/"{2,}/g, '"')
    .replace(/'{2,}/g, "'")
    .replace(/\s+"/g, ' "')
    .replace(/"\s+/g, '" ')
    .replace(/^\s*"\s*/g, "")
    .replace(/\s*"\s*$/g, "")
    .replace(/([.!?;:,])"/g, '$1"')
    .replace(/"([.!?;:,])/g, '"$1');
}

/**
 * Unifica M.N. con glifos griegos/especiales a ASCII puro,
 * más símbolos tipográficos frecuentes.
 */
function normalizeCurrencyAndSymbols(text: string): string {
  return text
    .split("\u039c.\u039d.")
    .join("M.N.")
    .split("Μ.Ν.")
    .join("M.N.")
    .replace(/(?:\u039C|\u03BC|M)\s*\.\s*(?:\u039D|\u03BD|N)\s*\./gi, "M.N.")
    .replace(/M\s*\.\s*N\s*\./gi, "M.N.")
    .replace(/\$\s*MXN/gi, "MXN")
    .replace(/pesos\s+m\.?\s*n\.?/gi, "pesos M.N.")
    .replace(/\u00A0/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/×/g, "x");
}

/**
 * Compacta espacios (sin romper `\n`) y limpia huecos antes de puntuación
 * (p. ej. `...) .` → `...).`).
 */
function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+([.,;)])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Marcadores tipo [RFC POR ASIGNAR]: limpia y normaliza a mayúsculas
 * sin caracteres raros. No inventa datos.
 */
function normalizeDraftMarkers(text: string): string {
  return text.replace(DRAFT_MARKER_RE, (_match, inner: string) => {
    const cleaned = String(inner)
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
    return cleaned ? `[${cleaned}]` : "";
  });
}

/** Quita mayúsculas sostenidas abusivas en párrafos largos (conserva siglas cortas) */
export function softenAllCapsParagraph(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length < 40) return trimmed;

  const letters = trimmed.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  if (letters.length < 20) return trimmed;

  const upper = (letters.match(/[A-ZÁÉÍÓÚÜÑ]/g) || []).length;
  const ratio = upper / letters.length;
  if (ratio < 0.85) return trimmed;

  // Title-case suave: primera mayúscula, resto minúsculas por oración
  return trimmed
    .toLowerCase()
    .replace(/(^\s*[a-záéíóúüñ]|[.!?]\s+[a-záéíóúüñ])/g, (m) => m.toUpperCase());
}

export function sanitizeContractText(raw: string, options?: { softenCaps?: boolean }): string {
  let text = String(raw ?? "");
  text = text.normalize("NFKC");
  text = normalizeQuotes(text);
  text = normalizeCurrencyAndSymbols(text);
  text = normalizeDraftMarkers(text);
  text = normalizeWhitespace(text);
  // Pase final estricto: glifos griegos exactos → ASCII M.N.
  text = text.split("\u039c.\u039d.").join("M.N.").split("Μ.Ν.").join("M.N.");
  if (options?.softenCaps !== false) {
    // Solo suaviza si el bloque completo parece ALL CAPS
    const paragraphs = text.split(/\n\n+/);
    text = paragraphs.map((p) => softenAllCapsParagraph(p)).join("\n\n");
  }
  return text;
}

export function sanitizeMultilineBody(raw: string): string {
  return sanitizeContractText(raw, { softenCaps: true })
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}
