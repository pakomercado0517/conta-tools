/**
 * Formatea conceptos técnicos con Unicode (fracciones, superíndices).
 * No modifica el valor almacenado; usar al mostrar, exportar o generar PDF.
 */

export type ConceptFormatRule = {
  input: string;
  output: string;
};

const UNICODE_FRACTIONS: Readonly<Record<string, string>> = {
  "7/8": "⅞",
  "5/8": "⅝",
  "3/8": "⅜",
  "1/8": "⅛",
  "3/4": "¾",
  "1/4": "¼",
  "1/2": "½",
};

/** Fracciones de mayor longitud primero para evitar reemplazos parciales. */
const FRACTION_KEYS_DESC = Object.keys(UNICODE_FRACTIONS).sort(
  (a, b) => b.length - a.length
);

const MIXED_FRACTION_REGEX =
  /(\d+)\s+(1\/2|1\/4|3\/4|1\/8|3\/8|5\/8|7\/8)\b/g;

/** cm/ft antes que m para no corromper "cm2" al reemplazar "m2". */
const EXPONENT_REPLACEMENTS: readonly { pattern: RegExp; output: string }[] =
  [
    { pattern: /cm2/gi, output: "cm²" },
    { pattern: /cm3/gi, output: "cm³" },
    { pattern: /ft2/gi, output: "ft²" },
    { pattern: /ft3/gi, output: "ft³" },
    { pattern: /m2/gi, output: "m²" },
    { pattern: /m3/gi, output: "m³" },
  ];

/** Reglas extra configurables (futuro: kg2 → kg², etc.). */
let customRules: ConceptFormatRule[] = [];

function applyMixedFractions(text: string): string {
  return text.replace(MIXED_FRACTION_REGEX, (match, whole: string, frac: string) => {
    const unicode = UNICODE_FRACTIONS[frac];
    return unicode ? `${whole}${unicode}` : match;
  });
}

function applyStandaloneFractions(text: string): string {
  let result = text;
  for (const key of FRACTION_KEYS_DESC) {
    const escaped = key.replace("/", "\\/");
    const regex = new RegExp(`(?<!\\d)${escaped}(?!\\d)`, "g");
    result = result.replace(regex, UNICODE_FRACTIONS[key]);
  }
  return result;
}

function applyExponents(text: string): string {
  let result = text;
  for (const { pattern, output } of EXPONENT_REPLACEMENTS) {
    result = result.replace(pattern, output);
  }
  for (const rule of customRules) {
    if (rule.input) {
      result = result.split(rule.input).join(rule.output);
    }
  }
  return result;
}

/**
 * Convierte fracciones y unidades en un concepto legible (Unicode).
 * @example formatConceptText('rejilla 1/2" y 2m3') → 'rejilla ½" y 2m³'
 */
export function formatConceptText(text: string): string {
  if (!text) return text;

  let result = text;
  result = applyMixedFractions(result);
  result = applyStandaloneFractions(result);
  result = applyExponents(result);
  return result;
}

/** Registra reglas adicionales (reemplazo literal, en orden de registro). */
export function registerConceptFormatRules(rules: ConceptFormatRule[]): void {
  customRules = [...rules];
}

/** Restablece reglas personalizadas (útil en tests). */
export function resetConceptFormatRules(): void {
  customRules = [];
}
