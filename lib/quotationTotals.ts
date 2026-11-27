import { numeroALetras } from "@/lib/numero-letras-mx";
import type {
  QuotationFormData,
  QuotationProduct,
  QuotationTaxLine,
} from "@/types/quotation";

export function parsePrecioUnitario(v: string | number): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const s = String(v).trim();
  if (s === "") return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function parseCantidad(v: string | number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Importe de la partida para la celda. `null` si no hay precio numérico. */
export function lineAmount(producto: QuotationProduct): number | null {
  const p = parsePrecioUnitario(producto.precioUnitario);
  if (p === null) return null;
  return parseCantidad(producto.cantidad) * p;
}

/** Importe de línea para subtotal e impuestos: solo si precio numérico > 0. */
export function lineTaxBase(producto: QuotationProduct): number {
  const p = parsePrecioUnitario(producto.precioUnitario);
  if (p === null || p <= 0) return 0;
  return parseCantidad(producto.cantidad) * p;
}

export function computeTaxMonto(
  base: number,
  tax: QuotationTaxLine
): number | null {
  if (base <= 0) return null;
  const raw = String(tax.valor ?? "").trim();
  if (raw === "") return null;
  const valor = Number(raw);
  if (!Number.isFinite(valor) || valor < 0) return null;
  if (tax.modo === "porcentaje") {
    return base * (valor / 100);
  }
  return valor;
}

export interface AggTaxRow {
  etiqueta: string;
  tipo: "impuesto" | "retencion";
  monto: number;
  /** Cuántas aplicaciones del concepto se sumaron (una o más líneas de producto). */
  fuentes: number;
}

export function aggregateTaxes(productos: QuotationProduct[]): {
  orderedKeys: string[];
  map: Map<string, AggTaxRow>;
} {
  const map = new Map<string, AggTaxRow>();
  const orderedKeys: string[] = [];

  for (const producto of productos) {
    const base = lineTaxBase(producto);
    if (base <= 0) continue;
    const taxes = producto.impuestosLinea ?? [];
    for (const tax of taxes) {
      const monto = computeTaxMonto(base, tax);
      if (monto === null || monto < 1e-9) continue;
      const valorNorm = String(tax.valor ?? "").trim();
      const key = `${tax.etiqueta}|${tax.tipo}|${tax.modo}|${valorNorm}`;
      const prev = map.get(key);
      if (prev) {
        prev.monto += monto;
        prev.fuentes += 1;
      } else {
        map.set(key, {
          etiqueta: (tax.etiqueta ?? "").trim() || "(Sin etiqueta)",
          tipo: tax.tipo,
          monto,
          fuentes: 1,
        });
        orderedKeys.push(key);
      }
    }
  }

  return { orderedKeys, map };
}

/** Etiqueta en PDF: categoría + texto del usuario (ej. «Impuesto IVA», «Impuestos IVA» si agrupa varias líneas). */
export function etiquetaFiscalPdf(
  tipo: "impuesto" | "retencion",
  etiquetaUsuario: string,
  fuentes: number
): string {
  const texto = etiquetaUsuario.trim();
  const parteUsuario = texto.length > 0 ? texto : "(Sin etiqueta)";
  const plural = fuentes > 1;
  if (tipo === "impuesto") {
    const cat = plural ? "Impuestos" : "Impuesto";
    return `${cat} ${parteUsuario}`;
  }
  const cat = plural ? "Retenciones" : "Retención";
  return `${cat} ${parteUsuario}`;
}

export interface QuotationTaxSummaryRow {
  key: string;
  etiquetaPdf: string;
  tipo: "impuesto" | "retencion";
  monto: number;
}

export interface QuotationSummary {
  subtotal: number;
  sumImpuestos: number;
  sumRetenciones: number;
  totalFinal: number;
  taxRows: QuotationTaxSummaryRow[];
}

export function computeQuotationSummary(
  productos: QuotationProduct[]
): QuotationSummary {
  const { orderedKeys, map } = aggregateTaxes(productos);
  const subtotal = productos.reduce((s, p) => s + lineTaxBase(p), 0);

  let sumImpuestos = 0;
  let sumRetenciones = 0;
  const taxRows: QuotationTaxSummaryRow[] = [];

  for (const key of orderedKeys) {
    const row = map.get(key);
    if (!row) continue;
    if (row.tipo === "impuesto") sumImpuestos += row.monto;
    else sumRetenciones += row.monto;
    taxRows.push({
      key,
      etiquetaPdf: etiquetaFiscalPdf(row.tipo, row.etiqueta, row.fuentes),
      tipo: row.tipo,
      monto: row.monto,
    });
  }

  const totalFinal =
    Math.round((subtotal + sumImpuestos - sumRetenciones) * 100) / 100;

  return { subtotal, sumImpuestos, sumRetenciones, totalFinal, taxRows };
}

export function quotationSummaryLabels(
  datos: Pick<
    QuotationFormData,
    "etiquetaSubtotal" | "etiquetaTotal" | "textoCantidadLetra"
  >
): {
  etiquetaSubtotal: string;
  etiquetaTotal: string;
  prefijoCantidadLetra: string;
} {
  return {
    etiquetaSubtotal:
      (datos.etiquetaSubtotal ?? "Subtotal:").trim() || "Subtotal:",
    etiquetaTotal: (datos.etiquetaTotal ?? "Total:").trim() || "Total:",
    prefijoCantidadLetra:
      (datos.textoCantidadLetra ?? "").trim() || "Importe con letra:",
  };
}

export function textoCantidadConLetra(
  totalFinal: number,
  prefijo: string
): string {
  const prefijoCantidadLetra = prefijo.trim() || "Importe con letra:";
  const letrasTotal = numeroALetras(totalFinal);
  return letrasTotal != null
    ? `${prefijoCantidadLetra} ${letrasTotal.charAt(0).toUpperCase() + letrasTotal.slice(1)}`
    : `${prefijoCantidadLetra} (Monto no disponible en letras)`;
}
