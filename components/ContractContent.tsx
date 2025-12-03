"use client";

import type { ContractData } from "@/schemas";

// ===== UTILIDADES REUTILIZABLES =====

/**
 * Crea un objeto Date local sin problemas de zona horaria
 * @param dateString - String de fecha
 * @returns Objeto Date o null si es inválido
 */
export function createLocalDate(dateString: string | undefined): Date | null {
  if (!dateString) return null;

  // Si es un string de fecha en formato YYYY-MM-DD, crear fecha local
  if (
    typeof dateString === "string" &&
    dateString.match(/^\d{4}-\d{2}-\d{2}$/)
  ) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // month es 0-indexado
  }

  // Para otros formatos, usar Date normal
  return new Date(dateString);
}

/**
 * Convierte una fecha (Date, string ISO o timestamp) a "DD de mes del YYYY"
 * @param fecha - Fecha a convertir
 * @param tz - Zona horaria (default: America/Mexico_City)
 * @returns String con formato español
 */
export function fechaEnLetras(fecha: Date | string | number, tz: string = "America/Mexico_City"): string {
  const d = new Date(fecha);
  const opts: Intl.DateTimeFormatOptions = { 
    timeZone: tz, 
    year: "numeric", 
    month: "long", 
    day: "2-digit" 
  };
  // "01 de enero de 2025"
  const base = new Intl.DateTimeFormat("es-MX", opts).format(d);
  const partes = base.split(" de ");
  if (partes.length >= 3) {
    return `${partes[0]} de ${partes[1]} del ${partes[2]}`;
  }
  return base;
}

/**
 * Genera leyenda de fecha y lugar: "Ciudad, a DD de mes del YYYY"
 * @param ciudad - Nombre de la ciudad
 * @param fecha - Fecha
 * @param tz - Zona horaria
 * @returns String formateado
 */
export function leyendaFechaLugar(ciudad: string, fecha: Date | string | number, tz: string = "America/Mexico_City"): string {
  return `${ciudad}, a ${fechaEnLetras(fecha, tz)}`;
}

/**
 * Formatea un número como moneda mexicana (ej: $1,234,567.89)
 * @param monto - Monto a formatear
 * @returns String formateado como moneda
 */
export function formatearMonedaMexicana(monto: string | number): string {
  if (!monto || monto === "[CANTIDAD NUMÉRICA]") return String(monto);

  // Limpiar el monto de cualquier formato previo
  let numeroLimpio = monto.toString().replace(/[\$\s,]/g, "");
  const numero = parseFloat(numeroLimpio);

  if (isNaN(numero)) return String(monto);

  // Formatear como moneda mexicana
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero);
}

// ====== Números a letras (MX, pesos y centavos) ======
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
 * Convierte un número a su representación en letras con formato mexicano
 * @param monto - Monto a convertir
 * @returns String con el número en letras o null si es inválido
 */
export function numeroALetras(monto: string | number): string | null {
  // Soporta string con $ y comas (separadores de miles mexicanos)
  let num: string | number = monto;

  if (typeof num === "string") {
    // Primero limpia $ y espacios
    num = num.replace(/[\$\s]/g, "").trim();

    // Lógica simplificada y más robusta:
    // 1. Si tiene punto Y coma: formato 1,234.56 (coma=miles, punto=decimal)
    // 2. Si solo tiene coma y después hay exactamente 2 dígitos: formato decimal 1234,50
    // 3. En todos los demás casos con coma: formato de miles 39,500 o 1,234,567

    const puntoIndex = num.lastIndexOf(".");
    const comaIndex = num.lastIndexOf(",");

    if (puntoIndex > -1 && comaIndex > -1 && puntoIndex > comaIndex) {
      // Caso 1: Formato 1,234.56 - eliminar comas (miles), mantener punto (decimal)
      num = num.replace(/,/g, "");
    } else if (comaIndex > -1) {
      // Solo tiene coma(s)
      const despuesComa = num.substring(comaIndex + 1);

      // Si después de la coma hay exactamente 2 dígitos y no hay más comas antes,
      // y la parte antes de la coma no tiene el patrón de miles (grupos de 3)
      const antesComa = num.substring(0, comaIndex);
      const esFormatoDecimal =
        despuesComa.length === 2 &&
        /^\d{2}$/.test(despuesComa) &&
        !antesComa.includes(",") &&
        antesComa.length <= 6; // Evita casos como 1234567,50

      if (esFormatoDecimal) {
        // Caso 2: Formato decimal 1234,50 -> 1234.50
        num = num.replace(",", ".");
      } else {
        // Caso 3: Formato de miles 39,500 o 1,234,567 -> eliminar todas las comas
        num = num.replace(/,/g, "");
      }
    }
  }

  const val = Number(num);
  if (!isFinite(val) || val < 0) return null;

  const entero = Math.floor(Math.abs(val));
  const cent = Math.round((Math.abs(val) - entero) * 100);

  let letras = numeroEnteroALetras(entero);
  // Ajuste "uno" -> "un" antes de sustantivo masculino
  letras = letras.replace(/\buno\b/g, "un");

  const centavos2 = cent.toString().padStart(2, "0");
  const moneda = entero === 1 ? "peso" : "pesos";

  // Formato clásico MX: "… pesos XX/100 M.N."
  return `${letras} ${moneda} ${centavos2}/100 M.N.`;
}

// ===== TIPOS PARA CONTENIDO PROCESADO DEL CONTRATO =====

interface ProcessedContractData extends Omit<ContractData, 'regimenVendedor' | 'regimenComprador'> {
  // Datos procesados adicionales
  prestadorNombre: string;
  clienteNombre: string;
  representanteVendedor: string;
  representanteCliente: string;
  
  // Términos dinámicos según tipo de contrato
  esServicio: boolean;
  terminoVendedor: string;
  terminoVendedorMin: string;
  terminoObjetivo: string;
  terminoTitulo: string;
  
  // Regímenes procesados (pueden ser diferentes a los originales)
  regimenVendedor: string | undefined;
  regimenComprador: string | undefined;
  textoConstitucion: string;
  
  // Fechas formateadas
  fechaInicioStr: string;
  fechaTerminoStr: string;
  fechaFirmaBase: Date;
  ciudadFirma: string;
  fechaFirmaCompleta: string;
  
  // Montos formateados
  montoTotalText: string;
  montoTextoCompleto: string;
  montoTotalRaw: string;
}

// ===== COMPONENTE DE CONTENIDO DEL CONTRATO =====

/**
 * Genera el contenido procesado del contrato con todos los campos calculados
 * @param contractData - Datos del contrato base
 * @returns Datos del contrato procesados y listos para renderizar
 */
export function generateContractContent(contractData: ContractData): ProcessedContractData {
  // Determinar tipo de contrato y términos apropiados
  const esServicio = contractData.tipoProducto === "servicio";
  const terminoVendedor = esServicio ? "EL PRESTADOR DE SERVICIOS" : "EL VENDEDOR";
  const terminoVendedorMin = esServicio ? "prestador de servicios" : "vendedor";
  const terminoObjetivo = esServicio ? "prestar" : "vender y transferir";
  const terminoTitulo = esServicio ? 
    "CONTRATO DE PRESTACIÓN DE SERVICIOS" : 
    "CONTRATO DE COMPRAVENTA DE MATERIALES Y/O SERVICIOS";
  
  // Nombres para usar en el contrato
  const prestadorNombre = (
    contractData.prestador || `[NOMBRE DEL ${terminoVendedorMin.toUpperCase()}]`
  ).toUpperCase();
  const clienteNombre = (
    contractData.cliente || "[NOMBRE DEL CLIENTE]"
  ).toUpperCase();
  // Formato: "NOMBRE, COMO REPRESENTANTE DEL ACTO [REPRESENTANTE]"
  const representanteVendedor = contractData.representantePrestador
    ? `, COMO REPRESENTANTE DEL ACTO ${contractData.representantePrestador.toUpperCase()}`
    : "";
  const representanteCliente = contractData.representanteCliente
    ? `, COMO REPRESENTANTE DEL ACTO ${contractData.representanteCliente.toUpperCase()}`
    : "";

  // Régimen fiscal
  const regimenVendedor =
    contractData.regimenVendedor === "Otro"
      ? contractData.regimenVendedorCustom
      : contractData.regimenVendedor;

  const regimenComprador =
    contractData.regimenComprador === "Otro"
      ? contractData.regimenCompradorCustom
      : contractData.regimenComprador;
  const textoConstitucion = (regimenComprador || "")
    .toLowerCase()
    .includes("moral")
    ? " debidamente constituida"
    : "";

  // Fechas
  const fechaInicioBase = contractData.fechaInicio
    ? createLocalDate(contractData.fechaInicio)
    : null;
  const fechaInicioStr = fechaInicioBase
    ? fechaEnLetras(fechaInicioBase)
    : "[FECHA DE INICIO]";

  let fechaTerminoStr = "[FECHA DE TÉRMINO]";
  if (contractData.fechaTermino === "otro") {
    fechaTerminoStr = contractData.fechaTerminoTexto || "[ESPECIFICAR TÉRMINO]";
  } else if (contractData.fechaTermino) {
    const f = createLocalDate(contractData.fechaTermino);
    fechaTerminoStr = f ? fechaEnLetras(f) : "[FECHA DE TÉRMINO]";
  }

  const fechaFirmaBase = contractData.fechaFirma
    ? createLocalDate(contractData.fechaFirma)
    : new Date();
  const ciudadFirma = contractData.ciudadFirma || "[CIUDAD]";

  // Precio
  const montoTotalRaw = contractData.montoTotal || "[CANTIDAD NUMÉRICA]";
  const montoTotalText = formatearMonedaMexicana(montoTotalRaw);
  let montoTextoCompleto = "";
  if ('montoTexto' in contractData && contractData.montoTexto) {
    montoTextoCompleto = ` (${contractData.montoTexto})`;
  } else {
    const letras = numeroALetras(montoTotalRaw);
    if (letras) {
      const letrasCap = letras.charAt(0).toUpperCase() + letras.slice(1);
      montoTextoCompleto = ` (${letrasCap})`;
    }
  }

  return {
    // Datos originales para uso directo (primero)
    ...contractData,
    
    // Datos procesados (estos sobrescriben los originales)
    prestadorNombre,
    clienteNombre,
    representanteVendedor,
    representanteCliente,

    // Términos dinámicos según tipo de contrato
    esServicio,
    terminoVendedor,
    terminoVendedorMin,
    terminoObjetivo,
    terminoTitulo,

    // Regímenes
    regimenVendedor,
    regimenComprador,
    textoConstitucion,

    // Fechas
    fechaInicioStr,
    fechaTerminoStr,
    fechaFirmaBase: fechaFirmaBase || new Date(),
    ciudadFirma,
    fechaFirmaCompleta: leyendaFechaLugar(ciudadFirma, fechaFirmaBase || new Date()),

    // Montos
    montoTotalText,
    montoTextoCompleto,
    montoTotalRaw,
  };
}

// Props del componente ContractContent
interface ContractContentProps {
  contractData: ContractData;
  invoicesData?: unknown[]; // Tipo genérico para invoices mientras se define específicamente
}

// ===== COMPONENTE DE PREVIEW =====
/**
 * Componente para mostrar el contenido completo del contrato
 * @param contractData - Datos del contrato
 * @param invoicesData - Datos opcionales de facturas (no utilizado actualmente)
 */
export default function ContractContent({ contractData }: ContractContentProps) {
  if (!contractData) return null;

  const content = generateContractContent(contractData);

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="space-y-4 text-sm leading-6 text-gray-800 dark:text-gray-200">
        {/* Título */}
        <div className="text-center">
          <h2 className="text-xl font-bold uppercase">
            {content.terminoTitulo}
          </h2>
        </div>

        {/* Introducción */}
        <p className="text-justify">
          QUE CELEBRAN POR UNA PARTE <strong>{content.prestadorNombre}</strong>
          {content.representanteVendedor}, A QUIEN EN LO SUCESIVO SE LE
          DENOMINARÁ COMO <strong>&quot;{content.terminoVendedor}&quot;</strong>, POR LA OTRA
          PARTE <strong>{content.clienteNombre}</strong>
          {content.representanteCliente}, A QUIEN EN LO SUCESIVO SE LE
          DENOMINARÁ COMO <strong>&quot;EL CLIENTE&quot;</strong>, Y A QUIENES
          DE MANERA CONJUNTA SE LES DENOMINARÁN COMO{" "}
          <strong>&quot;LAS PARTES&quot;</strong> AL TENOR DE LAS SIGUIENTES
          DECLARACIONES Y CLÁUSULAS:
        </p>

        {/* Declaraciones */}
        <div>
          <h3 className="mb-4 text-center text-lg font-bold">DECLARACIONES</h3>

          <div className="space-y-3">
            <div>
              <p className="font-semibold">
                I. Declara <strong>{content.terminoVendedor}</strong>, por conducto de sus
                representantes legales que:
              </p>
              <div className="ml-4 mt-2 space-y-2">
                <p>
                  <strong>A.</strong> Es una{" "}
                  {content.regimenVendedor?.toLowerCase() || "[régimen]"}{" "}
                  debidamente constituida de conformidad con las leyes de los
                  Estados Unidos Mexicanos.
                </p>

                {content.representantePrestador && (
                  <p>
                    <strong>B.</strong> Sus representantes legales cuentan con
                    las facultades necesarias para suscribir el presente
                    Contrato.
                  </p>
                )}

                <p>
                  <strong>{content.representantePrestador ? "C" : "B"}.</strong>{" "}
                  Tiene su domicilio en{" "}
                  <strong>
                    {content.domicilioPrestador ||
                      `[DOMICILIO COMPLETO DEL ${content.terminoVendedorMin.toUpperCase()}]`}
                  </strong>
                  .
                </p>

                <p>
                  <strong>{content.representantePrestador ? "D" : "C"}.</strong>{" "}
                  Es su deseo {content.terminoObjetivo}, sin reserva y limitación
                  alguna y libre de cualquier gravamen u otra limitación de
                  dominio al <strong>CLIENTE</strong> los materiales/servicios
                  que se describen en la cláusula primera del presente Contrato.
                </p>
              </div>
            </div>

            <div>
              <p className="font-semibold">
                II. DECLARA <strong>EL CLIENTE</strong>, POR CONDUCTO DE SU
                REPRESENTANTE LEGAL:
              </p>
              <div className="ml-4 mt-2 space-y-2">
                <p>
                  <strong>A.</strong> Es una{" "}
                  {content.regimenComprador?.toLowerCase() || "[régimen]"}
                  {content.textoConstitucion} de conformidad con las leyes de
                  los Estados Unidos Mexicanos.
                </p>

                {content.representanteCliente && (
                  <p>
                    <strong>B.</strong> Su representante legal cuenta con las
                    facultades necesarias para suscribir el presente Contrato.
                  </p>
                )}

                <p>
                  <strong>{content.representanteCliente ? "C" : "B"}.</strong>{" "}
                  Tiene su domicilio en{" "}
                  <strong>
                    {content.domicilioCliente ||
                      "[DOMICILIO COMPLETO DEL CLIENTE]"}
                  </strong>
                  .
                </p>

                <p>
                  <strong>{content.representanteCliente ? "D" : "C"}.</strong>{" "}
                  Es su deseo adquirir la propiedad plena de los
                  materiales/servicios en los términos y condiciones que se
                  establecen en el presente Contrato.
                </p>

                <p>
                  <strong>{content.representanteCliente ? "E" : "D"}.</strong>{" "}
                  Que cumple con todas sus obligaciones de carácter laboral y de
                  seguridad social, permisos y demás relativos aplicables de la
                  Legislación vigente en los Estados Unidos Mexicanos.
                </p>
              </div>
            </div>

            <div>
              <p className="font-semibold">
                De conformidad con las Declaraciones anteriores, Las Partes
                convienen en otorgar las siguientes:
              </p>
            </div>
          </div>
        </div>

        {/* Cláusulas */}
        <div>
          <h3 className="mb-4 text-center text-lg font-bold">CLÁUSULAS</h3>

          <div className="space-y-4">
            {/* Primera - Objeto */}
            <div>
              <p className="font-semibold">PRIMERA. OBJETO:</p>
              <p className="ml-4 text-justify">
                <strong>{content.terminoVendedor}</strong> se obliga a {content.esServicio ? "prestar los servicios" : "transmitir la propiedad"}
                {!content.esServicio && " sin reserva de dominio, libre de gravamen y limitación alguna"} de
                los {content.esServicio ? "servicios" : "materiales/servicios"} consistentes en:{" "}
                <strong>
                  {content.servicios ||
                    "[DESCRIPCIÓN DETALLADA DE MATERIALES/SERVICIOS]"}
                </strong>{" "}
                al <strong>CLIENTE</strong>, quien sabe y conoce plenamente
                las condiciones en que se encuentran los {content.esServicio ? "servicios" : "materiales/servicios"}, y
                quien deberá pagar la contraprestación prevista en la cláusula
                Segunda.
              </p>
            </div>

            {/* Segunda - Precio y Pago */}
            <div>
              <p className="font-semibold">SEGUNDA. PRECIO Y PAGO:</p>
              <div className="ml-4 space-y-2 text-justify">
                <p>
                  Las Partes acuerdan que el precio total de los
                  materiales/servicios será de{" "}
                  <strong>
                    {content.montoTotalText}
                    {content.montoTextoCompleto}
                  </strong>
                  , del cual se incluye el{" "}
                  <strong>16% (dieciséis por ciento)</strong> de{" "}
                  <strong>IVA</strong>.
                </p>

                {content.tipoPago === "una_exhibicion" ? (
                  <>
                    <p>
                      <strong>Forma de pago:</strong> Pago en una sola exhibición
                    </p>
                    <p>
                      <strong>Método de pago:</strong>{" "}
                      {content.formaPago || "[MÉTODO DE PAGO]"}
                    </p>
                  </>
                ) : content.tipoPago === "parcialidades" ? (
                  <>
                    <p>
                      <strong>Forma de pago:</strong> Pago en parcialidades
                    </p>
                    {content.condicionesPago && (
                      <p>
                        <strong>Condiciones de pago:</strong>{" "}
                        {content.condicionesPago}
                      </p>
                    )}
                    <p>
                      <strong>Método de pago:</strong>{" "}
                      {content.formaPago || "[MÉTODO DE PAGO]"}
                    </p>
                  </>
                ) : (
                  <>
                    {content.tipoPago === "otro" && content.condicionesPago && (
                      <p>
                        <strong>Condiciones de pago:</strong>{" "}
                        {content.condicionesPago}
                      </p>
                    )}
                    <p>
                      <strong>Método de pago:</strong>{" "}
                      {content.formaPago || "[MÉTODO DE PAGO]"}
                    </p>
                  </>
                )}

                {(content.banco ||
                  content.titularCuenta ||
                  content.numeroCuenta ||
                  content.clabeInterbancaria) && (
                  <div>
                    <p>
                      Las Partes acuerdan que previo al retiro de los
                      materiales/servicios, <strong>EL CLIENTE</strong> deberá
                      depositar el pago a la siguiente cuenta:
                    </p>
                    <ul className="ml-4 mt-2 space-y-1">
                      {content.banco && (
                        <li>
                          - <strong>Banco:</strong> {content.banco}
                        </li>
                      )}
                      {content.titularCuenta && (
                        <li>
                          - <strong>Titular de la cuenta:</strong>{" "}
                          {content.titularCuenta}
                        </li>
                      )}
                      {content.numeroCuenta && (
                        <li>
                          - <strong>Número de cuenta:</strong>{" "}
                          {content.numeroCuenta}
                        </li>
                      )}
                      {content.clabeInterbancaria && (
                        <li>
                          - <strong>CLABE interbancaria:</strong>{" "}
                          {content.clabeInterbancaria}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <p>
                  <strong>RECIBOS Y FACTURACIÓN. {content.terminoVendedor}</strong> se
                  compromete a emitir los{" "}
                  <strong>recibos o facturas fiscales</strong> correspondientes
                  por cada pago recibido, conforme a lo estipulado por las leyes
                  fiscales vigentes.
                </p>
              </div>
            </div>

            {/* Tercera - Vigencia */}
            <div>
              <p className="font-semibold">TERCERA. VIGENCIA:</p>
              <p className="ml-4 text-justify">
                El presente Contrato tendrá vigencia necesaria y suficiente para
                soportar la presente {content.esServicio ? "prestación de servicios" : "compraventa"}, misma que deberá realizarse en
                el periodo que va del <strong>{content.fechaInicioStr}</strong>{" "}
                al <strong>{content.fechaTerminoStr}</strong>.
              </p>
            </div>

            {/* Cuarta - Responsabilidad Laboral */}
            <div>
              <p className="font-semibold">CUARTA. RESPONSABILIDAD LABORAL:</p>
              <p className="ml-4 text-justify">
                Las Partes integrantes del presente Contrato son independientes
                entre sí y por ningún motivo serán consideradas como agentes o
                representantes, trabajadores o empleados de la otra. Cada una se
                responsabilizará de sus propias acciones y obligaciones con
                respecto a sus empleados. Las Partes asumen toda la
                responsabilidad derivada de la relación de trabajo con sus
                propios empleados, trabajadores o dependientes.
              </p>
            </div>

            {/* Quinta - Jurisdicción */}
            <div>
              <p className="font-semibold">QUINTA. JURISDICCIÓN:</p>
              <p className="ml-4 text-justify">
                Para la interpretación y cumplimiento del presente Contrato, las
                Partes se someten a la jurisdicción de los tribunales
                competentes en{" "}
                <strong>{content.jurisdiccion || "[CIUDAD/ESTADO]"}</strong>,
                renunciando expresamente a cualquier otro fuero que por razón de
                sus domicilios presentes o futuros les pudiera corresponder o
                por cualquier otra causa.
              </p>
            </div>
          </div>
        </div>

        {/* Firma */}
        <div className="pt-4">
          <p className="mb-6 text-justify">
            Leído que fue el presente Contrato y enteradas las Partes de su
            contenido y alcance legal, lo firman por duplicado en{" "}
            <strong>{content.fechaFirmaCompleta}</strong>.
          </p>

          <div className="mt-12 space-y-8">
            {/* EL CLIENTE */}
            <div className="text-center">
              <p className="mb-2 text-lg font-semibold">EL CLIENTE</p>

              {content.imagenFirmaComprador && (
                <div className="mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.imagenFirmaComprador}
                    alt="Firma Comprador"
                    className="mx-auto max-h-16 object-contain"
                  />
                </div>
              )}

              <div className="mx-auto mb-2 w-48 border-t border-gray-800 dark:border-gray-400"></div>
              <p className="font-bold">{content.clienteNombre}</p>
              {content.representanteCliente && (
                <>
                  <p className="mt-1 text-sm">
                    {content.representanteCliente.toUpperCase()}
                  </p>
                  <p className="text-xs italic">Representante Legal</p>
                </>
              )}
            </div>

            {/* VENDEDOR/PRESTADOR */}
            <div className="mt-16 text-center">
              <p className="mb-2 text-lg font-semibold">{content.terminoVendedor}</p>

              {content.imagenFirmaVendedor && (
                <div className="mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.imagenFirmaVendedor}
                    alt="Firma Vendedor"
                    className="mx-auto max-h-16 object-contain"
                  />
                </div>
              )}

              <div className="mx-auto mb-2 w-48 border-t border-gray-800 dark:border-gray-400"></div>
              <p className="font-bold">{content.prestadorNombre}</p>
              {content.representantePrestador && (
                <>
                  <p className="mt-1 text-sm">
                    {content.representantePrestador.toUpperCase()}
                  </p>
                  <p className="text-xs italic">Representante Legal</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Las utilidades ya se exportan individualmente donde están definidas