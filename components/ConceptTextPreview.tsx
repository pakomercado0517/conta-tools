"use client";

import FormattedConceptText from "@/components/FormattedConceptText";
import { formatConceptText } from "@/lib/formatConceptText";

type ConceptTextPreviewProps = {
  text: string;
  className?: string;
  label?: string;
};

/**
 * Vista previa del formateo bajo campos de concepto (el input guarda texto crudo).
 */
export default function ConceptTextPreview({
  text,
  className = "",
  label = "Vista en cotización / PDF:",
}: ConceptTextPreviewProps) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const lines = trimmed.split(/\r?\n/);
  const formattedJoined = lines
    .map((line) => formatConceptText(line))
    .join("\n");
  const changed = formattedJoined !== trimmed;

  return (
    <p
      className={`mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-gray-400 ${className}`}
      aria-live="polite"
    >
      <span className="font-medium text-gray-500">{label} </span>
      <span className={changed ? "text-cyan-200/90" : "text-gray-300"}>
        {lines.map((line, i) => (
          <span key={i}>
            {i > 0 ? "\n" : null}
            <FormattedConceptText text={line} format />
          </span>
        ))}
      </span>
    </p>
  );
}
