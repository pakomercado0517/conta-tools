/**
 * Conversión de números a letras (MXN, pesos y centavos).
 * Compartido entre cotizaciones, contratos y otros documentos.
 */

const UNIDADES: string[] = [
  "",
  "uno",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
  "diez",
  "once",
  "doce",
  "trece",
  "catorce",
  "quince",
  "dieciséis",
  "diecisiete",
  "dieciocho",
  "diecinueve",
  "veinte",
  "veintiuno",
  "veintidós",
  "veintitrés",
  "veinticuatro",
  "veinticinco",
  "veintiséis",
  "veintisiete",
  "veintiocho",
  "veintinueve",
];

const DECENAS: string[] = [
  "",
  "",
  "veinte",
  "treinta",
  "cuarenta",
  "cincuenta",
  "sesenta",
  "setenta",
  "ochenta",
  "noventa",
];

const CENTENAS: string[] = [
  "",
  "ciento",
  "doscientos",
  "trescientos",
  "cuatrocientos",
  "quinientos",
  "seiscientos",
  "setecientos",
  "ochocientos",
  "novecientos",
];

function centenasALetras(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cien";
  const c = Math.floor(n / 100);
  const r = n % 100;
  let out = c > 0 ? CENTENAS[c] : "";
  if (r > 0) {
    if (out) out += " ";
    out += decenasALetras(r);
  }
  return out;
}

function decenasALetras(n: number): string {
  if (n < 30) return UNIDADES[n];
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return DECENAS[d];
  return `${DECENAS[d]} y ${UNIDADES[u]}`;
}

function grupoALetras(n: number): string {
  return centenasALetras(n);
}

function numeroEnteroALetras(n: number): string {
  if (n === 0) return "cero";
  let letras = "";
  const miles = Math.floor((n % 1_000_000) / 1000);
  const millones = Math.floor(n / 1_000_000);
  const centenas = n % 1000;

  if (millones > 0) {
    if (millones === 1) letras += "un millón";
    else letras += `${numeroEnteroALetras(millones)} millones`;
  }

  if (miles > 0) {
    if (letras) letras += " ";
    if (miles === 1) letras += "mil";
    else letras += `${grupoALetras(miles)} mil`;
  }

  if (centenas > 0) {
    if (letras) letras += " ";
    letras += grupoALetras(centenas);
  }

  return letras;
}

/**
 * Convierte un número a su representación en letras con formato mexicano.
 * @returns String con el número en letras o null si es inválido
 */
export function numeroALetras(monto: string | number): string | null {
  let num: string | number = monto;

  if (typeof num === "string") {
    num = num.replace(/[\$\s]/g, "").trim();

    const puntoIndex = num.lastIndexOf(".");
    const comaIndex = num.lastIndexOf(",");

    if (puntoIndex > -1 && comaIndex > -1 && puntoIndex > comaIndex) {
      num = num.replace(/,/g, "");
    } else if (comaIndex > -1) {
      const despuesComa = num.substring(comaIndex + 1);
      const antesComa = num.substring(0, comaIndex);
      const esFormatoDecimal =
        despuesComa.length === 2 &&
        /^\d{2}$/.test(despuesComa) &&
        !antesComa.includes(",") &&
        antesComa.length <= 6;

      if (esFormatoDecimal) {
        num = num.replace(",", ".");
      } else {
        num = num.replace(/,/g, "");
      }
    }
  }

  const val = Number(num);
  if (!isFinite(val) || val < 0) return null;

  const entero = Math.floor(Math.abs(val));
  const cent = Math.round((Math.abs(val) - entero) * 100);

  let letras = numeroEnteroALetras(entero);
  letras = letras.replace(/\buno\b/g, "un");

  const centavos2 = cent.toString().padStart(2, "0");
  const moneda = entero === 1 ? "peso" : "pesos";

  return `${letras} ${moneda} ${centavos2}/100 M.N.`;
}
