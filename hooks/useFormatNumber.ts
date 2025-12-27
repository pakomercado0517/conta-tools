// Opciones de configuración para el formateo de números
interface NumberFormatOptions {
  locale?: string;
  currency?: string;
  style?: "currency" | "decimal" | "percent";
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Configuración por defecto para moneda mexicana
const DEFAULT_CONFIG: NumberFormatOptions = {
  locale: "es-MX",
  currency: "MXN",
  style: "currency",
};

/**
 * Hook personalizado para formatear números como moneda mexicana
 * @param config - Configuración opcional para personalizar el formato
 * @returns Formatter de Intl.NumberFormat configurado
 */
export default function useFormatNumber(
  config: NumberFormatOptions = DEFAULT_CONFIG
): Intl.NumberFormat {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const formatNumber = new Intl.NumberFormat(finalConfig.locale, {
    style: finalConfig.style,
    currency: finalConfig.currency,
    minimumFractionDigits: finalConfig.minimumFractionDigits,
    maximumFractionDigits: finalConfig.maximumFractionDigits,
  });

  return formatNumber;
}

/**
 * Función utilitaria para formatear un número como moneda directamente
 * @param value - Valor numérico a formatear
 * @param config - Configuración opcional
 * @returns String formateado
 */
export function formatCurrency(
  value: number,
  config: NumberFormatOptions = DEFAULT_CONFIG
): string {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const formatter = new Intl.NumberFormat(finalConfig.locale, {
    style: finalConfig.style,
    currency: finalConfig.currency,
    minimumFractionDigits: finalConfig.minimumFractionDigits,
    maximumFractionDigits: finalConfig.maximumFractionDigits,
  });
  return formatter.format(value);
}

/**
 * Función utilitaria para formatear como decimal sin símbolo de moneda
 * @param value - Valor numérico a formatear
 * @param decimals - Número de decimales (opcional)
 * @returns String formateado
 */
export function formatDecimal(value: number, decimals: number = 2): string {
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "decimal",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(value);
}

/**
 * Función utilitaria para formatear como porcentaje
 * @param value - Valor decimal a formatear (ej. 0.15 para 15%)
 * @param decimals - Número de decimales (opcional)
 * @returns String formateado
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(value);
}
