"use client";

// ===== UTILIDADES REUTILIZABLES =====

// Crea un objeto Date local sin problemas de zona horaria
export function createLocalDate(dateString) {
  if (!dateString) return null;
  
  // Si es un string de fecha en formato YYYY-MM-DD, crear fecha local
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month es 0-indexado
  }
  
  // Para otros formatos, usar Date normal
  return new Date(dateString);
}

// Convierte una fecha (Date, string ISO o timestamp) a "DD de mes del YYYY"
export function fechaEnLetras(fecha, tz = "America/Mexico_City") {
  const d = new Date(fecha);
  const opts = { timeZone: tz, year: "numeric", month: "long", day: "2-digit" };
  // "01 de enero de 2025"
  const base = new Intl.DateTimeFormat("es-MX", opts).format(d);
  const partes = base.split(" de ");
  if (partes.length >= 3) {
    return `${partes[0]} de ${partes[1]} del ${partes[2]}`;
  }
  return base;
}

// "Ciudad, a DD de mes del YYYY"
export function leyendaFechaLugar(ciudad, fecha, tz = "America/Mexico_City") {
  return `${ciudad}, a ${fechaEnLetras(fecha, tz)}`;
}

// Formatea un número como moneda mexicana (ej: $1,234,567.89)
export function formatearMonedaMexicana(monto) {
  if (!monto || monto === "[CANTIDAD NUMÉRICA]") return monto;
  
  // Limpiar el monto de cualquier formato previo
  let numeroLimpio = monto.toString().replace(/[\$\s,]/g, "");
  const numero = parseFloat(numeroLimpio);
  
  if (isNaN(numero)) return monto;
  
  // Formatear como moneda mexicana
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);
}

// ====== Números a letras (MX, pesos y centavos) ======
const UNIDADES = [
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

const DECENAS = [
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

const CENTENAS = [
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

function centenasALetras(n) {
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

function decenasALetras(n) {
  if (n < 30) return UNIDADES[n];
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return DECENAS[d];
  return `${DECENAS[d]} y ${UNIDADES[u]}`;
}

function grupoALetras(n) {
  return centenasALetras(n);
}

function numeroEnteroALetras(n) {
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

export function numeroALetras(monto) {
  // Soporta string con $ y comas (separadores de miles mexicanos)
  let num = monto;

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

// ===== COMPONENTE DE CONTENIDO DEL CONTRATO =====

export function generateContractContent(contractData) {
  // Nombres para usar en el contrato
  const prestadorNombre = (
    contractData.prestador || "[NOMBRE DEL VENDEDOR]"
  ).toUpperCase();
  const clienteNombre = (
    contractData.cliente || "[NOMBRE DEL COMPRADOR]"
  ).toUpperCase();
  const representanteVendedor = contractData.representantePrestador
    ? `, REPRESENTADA EN ESTE ACTO POR ${contractData.representantePrestador.toUpperCase()}`
    : "";
  const representanteCliente = contractData.representanteCliente
    ? `, REPRESENTADA POR ${contractData.representanteCliente.toUpperCase()}`
    : "";

  // Régimen fiscal
  const regimenVendedor = contractData.regimenVendedor === "Otro" 
    ? contractData.regimenVendedorCustom 
    : contractData.regimenVendedor;
  
  const regimenComprador = contractData.regimenComprador === "Otro"
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
    fechaTerminoStr = fechaEnLetras(f);
  }

  const fechaFirmaBase = contractData.fechaFirma
    ? createLocalDate(contractData.fechaFirma)
    : new Date();
  const ciudadFirma = contractData.ciudadFirma || "[CIUDAD]";

  // Precio
  const montoTotalRaw = contractData.montoTotal || "[CANTIDAD NUMÉRICA]";
  const montoTotalText = formatearMonedaMexicana(montoTotalRaw);
  let montoTextoCompleto = "";
  if (contractData.montoTexto) {
    montoTextoCompleto = ` (${contractData.montoTexto})`;
  } else {
    const letras = numeroALetras(montoTotalRaw);
    if (letras) {
      const letrasCap = letras.charAt(0).toUpperCase() + letras.slice(1);
      montoTextoCompleto = ` (${letrasCap})`;
    }
  }

  return {
    // Datos básicos
    prestadorNombre,
    clienteNombre,
    representanteVendedor,
    representanteCliente,
    
    // Regímenes
    regimenVendedor,
    regimenComprador,
    textoConstitucion,
    
    // Fechas
    fechaInicioStr,
    fechaTerminoStr,
    fechaFirmaBase,
    ciudadFirma,
    fechaFirmaCompleta: leyendaFechaLugar(ciudadFirma, fechaFirmaBase),
    
    // Montos
    montoTotalText,
    montoTextoCompleto,
    montoTotalRaw,
    
    // Datos originales para uso directo
    ...contractData
  };
}

// ===== COMPONENTE DE PREVIEW =====
export default function ContractContent({ contractData, invoicesData }) {
  if (!contractData) return null;

  const content = generateContractContent(contractData);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <div className="space-y-4 text-sm leading-6 text-gray-800 dark:text-gray-200">
        
        {/* Título */}
        <div className="text-center">
          <h2 className="text-xl font-bold uppercase">
            CONTRATO DE COMPRAVENTA DE MATERIALES Y/O SERVICIOS
          </h2>
        </div>

        {/* Introducción */}
        <p className="text-justify">
          QUE CELEBRAN POR UNA PARTE <strong>{content.prestadorNombre}</strong>{content.representanteVendedor}, A QUIEN EN LO SUCESIVO SE LE DENOMINARÁ COMO <strong>"EL VENDEDOR"</strong>, POR LA OTRA PARTE <strong>{content.clienteNombre}</strong>{content.representanteCliente}, A QUIEN EN LO SUCESIVO SE LE DENOMINARÁ COMO <strong>"EL COMPRADOR"</strong>, Y A QUIENES DE MANERA CONJUNTA SE LES DENOMINARÁN COMO <strong>"LAS PARTES"</strong> AL TENOR DE LAS SIGUIENTES DECLARACIONES Y CLÁUSULAS:
        </p>

        {/* Declaraciones */}
        <div>
          <h3 className="text-lg font-bold text-center mb-4">DECLARACIONES</h3>
          
          <div className="space-y-3">
            <div>
              <p className="font-semibold">I. Declara <strong>EL VENDEDOR</strong>, por conducto de sus representantes legales que:</p>
              <div className="ml-4 space-y-2 mt-2">
                <p><strong>A.</strong> Es una {content.regimenVendedor?.toLowerCase() || "[régimen]"} debidamente constituida de conformidad con las leyes de los Estados Unidos Mexicanos.</p>
                
                {content.representantePrestador && (
                  <p><strong>B.</strong> Sus representantes legales cuentan con las facultades necesarias para suscribir el presente Contrato.</p>
                )}
                
                <p><strong>{content.representantePrestador ? 'C' : 'B'}.</strong> Tiene su domicilio en <strong>{content.domicilioPrestador || "[DOMICILIO COMPLETO DEL VENDEDOR]"}</strong>.</p>
                
                <p><strong>{content.representantePrestador ? 'D' : 'C'}.</strong> Es su deseo vender y transferir, sin reserva y limitación alguna y libre de cualquier gravamen u otra limitación de dominio al <strong>COMPRADOR</strong> los materiales/servicios que se describen en la cláusula primera del presente Contrato.</p>
              </div>
            </div>

            <div>
              <p className="font-semibold">II. DECLARA <strong>EL COMPRADOR</strong>, POR CONDUCTO DE SU REPRESENTANTE LEGAL:</p>
              <div className="ml-4 space-y-2 mt-2">
                <p><strong>A.</strong> Es una {content.regimenComprador?.toLowerCase() || "[régimen]"}{content.textoConstitucion} de conformidad con las leyes de los Estados Unidos Mexicanos.</p>
                
                {content.representanteCliente && (
                  <p><strong>B.</strong> Su representante legal cuenta con las facultades necesarias para suscribir el presente Contrato.</p>
                )}
                
                <p><strong>{content.representanteCliente ? 'C' : 'B'}.</strong> Tiene su domicilio en <strong>{content.domicilioCliente || "[DOMICILIO COMPLETO DEL COMPRADOR]"}</strong>.</p>
                
                <p><strong>{content.representanteCliente ? 'D' : 'C'}.</strong> Es su deseo adquirir la propiedad plena de los materiales/servicios en los términos y condiciones que se establecen en el presente Contrato.</p>
                
                <p><strong>{content.representanteCliente ? 'E' : 'D'}.</strong> Que cumple con todas sus obligaciones de carácter laboral y de seguridad social, permisos y demás relativos aplicables de la Legislación vigente en los Estados Unidos Mexicanos.</p>
              </div>
            </div>

            <div>
              <p className="font-semibold">De conformidad con las Declaraciones anteriores, Las Partes convienen en otorgar las siguientes:</p>
            </div>
          </div>
        </div>

        {/* Cláusulas */}
        <div>
          <h3 className="text-lg font-bold text-center mb-4">CLÁUSULAS</h3>
          
          <div className="space-y-4">
            {/* Primera - Objeto */}
            <div>
              <p className="font-semibold">PRIMERA. OBJETO:</p>
              <p className="ml-4 text-justify">
                <strong>EL VENDEDOR</strong> se obliga a transmitir la propiedad sin reserva de dominio, libre de gravamen y limitación alguna de los materiales/servicios consistentes en: <strong>{content.servicios || "[DESCRIPCIÓN DETALLADA DE MATERIALES/SERVICIOS]"}</strong> al <strong>COMPRADOR</strong>, quien sabe y conoce plenamente las condiciones en que se encuentran los materiales/servicios, y quien deberá pagar la contraprestación prevista en la cláusula Segunda.
              </p>
            </div>

            {/* Segunda - Precio y Pago */}
            <div>
              <p className="font-semibold">SEGUNDA. PRECIO Y PAGO:</p>
              <div className="ml-4 text-justify space-y-2">
                <p>Las Partes acuerdan que el precio total de los materiales/servicios será de <strong>{content.montoTotalText}{content.montoTextoCompleto}</strong>, del cual se incluye el <strong>16% (dieciséis por ciento)</strong> de <strong>IVA</strong>.</p>
                
                <p><strong>Forma de pago:</strong> {content.formaPago || "[FORMA DE PAGO]"}</p>
                
                {(content.banco || content.titularCuenta || content.numeroCuenta || content.clabeInterbancaria) && (
                  <div>
                    <p>Las Partes acuerdan que previo al retiro de los materiales/servicios, <strong>EL COMPRADOR</strong> deberá depositar el pago a la siguiente cuenta:</p>
                    <ul className="ml-4 space-y-1 mt-2">
                      {content.banco && <li>- <strong>Banco:</strong> {content.banco}</li>}
                      {content.titularCuenta && <li>- <strong>Titular de la cuenta:</strong> {content.titularCuenta}</li>}
                      {content.numeroCuenta && <li>- <strong>Número de cuenta:</strong> {content.numeroCuenta}</li>}
                      {content.clabeInterbancaria && <li>- <strong>CLABE interbancaria:</strong> {content.clabeInterbancaria}</li>}
                    </ul>
                  </div>
                )}
                
                <p><strong>RECIBOS Y FACTURACIÓN. EL VENDEDOR</strong> se compromete a emitir los <strong>recibos o facturas fiscales</strong> correspondientes por cada pago recibido, conforme a lo estipulado por las leyes fiscales vigentes.</p>
              </div>
            </div>

            {/* Tercera - Vigencia */}
            <div>
              <p className="font-semibold">TERCERA. VIGENCIA:</p>
              <p className="ml-4 text-justify">
                El presente Contrato tendrá vigencia necesaria y suficiente para soportar la presente compraventa, misma que deberá realizarse en el periodo que va del <strong>{content.fechaInicioStr}</strong> al <strong>{content.fechaTerminoStr}</strong>.
              </p>
            </div>

            {/* Cuarta - Responsabilidad Laboral */}
            <div>
              <p className="font-semibold">CUARTA. RESPONSABILIDAD LABORAL:</p>
              <p className="ml-4 text-justify">
                Las Partes integrantes del presente Contrato son independientes entre sí y por ningún motivo serán consideradas como agentes o representantes, trabajadores o empleados de la otra. Cada una se responsabilizará de sus propias acciones y obligaciones con respecto a sus empleados. Las Partes asumen toda la responsabilidad derivada de la relación de trabajo con sus propios empleados, trabajadores o dependientes.
              </p>
            </div>

            {/* Quinta - Jurisdicción */}
            <div>
              <p className="font-semibold">QUINTA. JURISDICCIÓN:</p>
              <p className="ml-4 text-justify">
                Para la interpretación y cumplimiento del presente Contrato, las Partes se someten a la jurisdicción de los tribunales competentes en <strong>{content.jurisdiccion || "[CIUDAD/ESTADO]"}</strong>, renunciando expresamente a cualquier otro fuero que por razón de sus domicilios presentes o futuros les pudiera corresponder o por cualquier otra causa.
              </p>
            </div>
          </div>
        </div>

        {/* Firma */}
        <div className="pt-4">
          <p className="text-justify mb-6">
            Leído que fue el presente Contrato y enteradas las Partes de su contenido y alcance legal, lo firman por duplicado en <strong>{content.fechaFirmaCompleta}</strong>.
          </p>
          
          <div className="space-y-8 mt-12">
            {/* EL COMPRADOR */}
            <div className="text-center">
              <p className="font-semibold text-lg mb-2">EL COMPRADOR</p>
              
              {content.imagenFirmaComprador && (
                <div className="mb-2">
                  <img 
                    src={content.imagenFirmaComprador} 
                    alt="Firma Comprador" 
                    className="max-h-16 mx-auto object-contain"
                  />
                </div>
              )}
              
              <div className="border-t border-gray-800 dark:border-gray-400 w-48 mx-auto mb-2"></div>
              <p className="font-bold">{content.clienteNombre}</p>
              {content.representanteCliente && (
                <>
                  <p className="text-sm mt-1">{content.representanteCliente.toUpperCase()}</p>
                  <p className="text-xs italic">Representante Legal</p>
                </>
              )}
            </div>

            {/* EL VENDEDOR */}
            <div className="text-center mt-16">
              <p className="font-semibold text-lg mb-2">EL VENDEDOR</p>
              
              {content.imagenFirmaVendedor && (
                <div className="mb-2">
                  <img 
                    src={content.imagenFirmaVendedor} 
                    alt="Firma Vendedor" 
                    className="max-h-16 mx-auto object-contain"
                  />
                </div>
              )}
              
              <div className="border-t border-gray-800 dark:border-gray-400 w-48 mx-auto mb-2"></div>
              <p className="font-bold">{content.prestadorNombre}</p>
              {content.representantePrestador && (
                <>
                  <p className="text-sm mt-1">{content.representantePrestador.toUpperCase()}</p>
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
