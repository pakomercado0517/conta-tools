/**
 * Utilidades para extraer y reparar JSON generado por LLMs
 * (comillas faltantes, saltos de línea literales, fences markdown, etc.)
 */

export function extractJsonObject(raw: string): string {
  let text = raw.trim();

  // Quitar fences markdown (inicio/fin o embebidos)
  text = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch?.[1]) {
    text = fenceMatch[1].trim();
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No se encontró un objeto JSON en la respuesta");
  }

  return text.slice(start, end + 1);
}

/** Elimina comas colgantes antes de } o ] */
export function removeTrailingCommas(json: string): string {
  return json.replace(/,\s*([}\]])/g, "$1");
}

/**
 * Dentro de strings JSON ya abiertos:
 * - escapa saltos de línea / tabs literales
 * - escapa comillas internas que no cierran el string
 */
export function sanitizeJsonStringLiterals(json: string): string {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];

    if (!inString) {
      if (ch === '"') inString = true;
      result += ch;
      continue;
    }

    // Dentro de string
    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      result += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      // ¿Cierra el string o es comilla interna sin escapar?
      const lookahead = json.slice(i + 1).match(/^\s*[,:}\]]/);
      if (lookahead) {
        inString = false;
        result += ch;
      } else {
        result += '\\"';
      }
      continue;
    }

    if (ch === "\n") {
      result += "\\n";
      continue;
    }
    if (ch === "\r") {
      result += "\\r";
      continue;
    }
    if (ch === "\t") {
      result += "\\t";
      continue;
    }

    // Control chars inválidos en JSON
    const code = ch.charCodeAt(0);
    if (code < 0x20) {
      result += `\\u${code.toString(16).padStart(4, "0")}`;
      continue;
    }

    result += ch;
  }

  return result;
}

/**
 * Si tras un `:` el valor no empieza con token JSON válido,
 * lo trata como texto y lo envuelve con comillas (escapado).
 */
export function quoteUnquotedValues(json: string): string {
  let result = "";
  let i = 0;
  let inString = false;
  let escaped = false;

  while (i < json.length) {
    const ch = json[i];

    if (inString) {
      result += ch;
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      i++;
      continue;
    }

    if (ch === '"') {
      inString = true;
      result += ch;
      i++;
      continue;
    }

    if (ch === ":") {
      result += ch;
      i++;

      // Conservar whitespace tras :
      while (i < json.length && /\s/.test(json[i])) {
        result += json[i];
        i++;
      }

      if (i >= json.length) break;

      const next = json[i];
      const startsValidToken =
        next === '"' ||
        next === "{" ||
        next === "[" ||
        next === "t" || // true
        next === "f" || // false
        next === "n" || // null
        next === "-" ||
        (next >= "0" && next <= "9");

      if (!startsValidToken) {
        const rest = json.slice(i);
        const end = findUnquotedValueEnd(rest);
        const rawValue = rest.slice(0, end).replace(/\s+$/, "");
        result += JSON.stringify(rawValue);
        i += end;
        continue;
      }

      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

/**
 * Fin de un valor sin comillas:
 * - siguiente `,"clave":`
 * - o `}` / `]` estructurales
 */
function findUnquotedValueEnd(s: string): number {
  const nextKey = s.search(/,\s*"[^"]+"\s*:/);
  const closer = s.search(/[}\]]/);

  if (nextKey === -1 && closer === -1) return s.length;
  if (nextKey === -1) return closer;
  if (closer === -1) return nextKey;
  return Math.min(nextKey, closer);
}

export function tryParseJson(text: string): unknown {
  return JSON.parse(text);
}

/**
 * Intenta parsear con varias capas de reparación.
 * Devuelve el objeto o lanza el último error de parseo.
 */
export function parseJsonLenient(rawContent: string): unknown {
  const extracted = extractJsonObject(rawContent);
  const attempts: string[] = [];

  const base = removeTrailingCommas(extracted);
  attempts.push(base);
  attempts.push(sanitizeJsonStringLiterals(base));
  attempts.push(quoteUnquotedValues(base));
  attempts.push(sanitizeJsonStringLiterals(quoteUnquotedValues(base)));
  attempts.push(
    sanitizeJsonStringLiterals(quoteUnquotedValues(removeTrailingCommas(extracted)))
  );

  // Deduplicar intentos idénticos
  const unique = Array.from(new Set(attempts));

  let lastError: Error | null = null;
  for (const candidate of unique) {
    try {
      return tryParseJson(candidate);
    } catch (e) {
      lastError = e as Error;
    }
  }

  throw lastError || new Error("No se pudo parsear JSON");
}
