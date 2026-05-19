"use client";

import { formatConceptText } from "@/lib/formatConceptText";

type FormattedConceptTextProps = {
  text: string;
  className?: string;
  /** Si true, aplica formateo aunque el texto esté vacío (devuelve vacío). */
  format?: boolean;
};

/**
 * Muestra un concepto con fracciones y exponentes en Unicode (PDF, UI, texto plano).
 */
export default function FormattedConceptText({
  text,
  className = "",
  format = true,
}: FormattedConceptTextProps) {
  const display = format ? formatConceptText(text) : text;
  return <span className={className}>{display}</span>;
}
