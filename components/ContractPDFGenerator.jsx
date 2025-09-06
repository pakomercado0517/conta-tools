"use client";

import { jsPDF } from "jspdf";

/**
 * Genera un PDF del contrato de prestación de servicios
 * @param {Object} contractData - Datos del contrato
 * @param {Object[]} invoicesData - Datos de las facturas
 * @returns {jsPDF} - Documento PDF generado
 */
export function generateContractPDF(contractData, invoicesData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 6;
  let yPosition = margin;

  // Función para agregar texto con manejo de página
  const addText = (text, fontSize = 10, isBold = false, align = 'left') => {
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    
    if (align === 'center') {
      doc.text(text, pageWidth / 2, yPosition, { align: 'center' });
    } else if (align === 'justify') {
      const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin);
      doc.text(splitText, margin, yPosition);
      yPosition += (splitText.length - 1) * lineHeight;
    } else {
      const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin);
      doc.text(splitText, margin, yPosition);
      yPosition += (splitText.length - 1) * lineHeight;
    }
    
    yPosition += lineHeight;
  };

  // Función para agregar espacio
  const addSpace = (space = lineHeight) => {
    yPosition += space;
  };

  // Título
  addText("CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES", 16, true, 'center');
  addSpace(10);

  // Introducción
  const introText = `que celebran, por una parte, ${contractData.prestador || '[NOMBRE COMPLETO DEL PRESTADOR DE SERVICIOS]'}, por su propio derecho, en adelante denominado como EL PRESTADOR, y por la otra, ${contractData.cliente || '[NOMBRE COMPLETO DEL CLIENTE]'}, por su propio derecho, en adelante denominado como EL CLIENTE, al tenor de las siguientes:`;
  addText(introText, 10, false, 'justify');
  addSpace();

  // DECLARACIONES
  addText("DECLARACIONES", 12, true, 'center');
  addSpace();

  addText("I. Declara EL PRESTADOR:", 11, true);
  addText("a) Ser una persona física de nacionalidad mexicana, mayor de edad, con plena capacidad legal para celebrar el presente contrato.", 10, false, 'justify');
  addText("b) Contar con los conocimientos, experiencia, herramientas y habilidades necesarias para prestar los servicios objeto de este contrato.", 10, false, 'justify');
  addText(`c) Que su domicilio para los efectos del presente instrumento es ${contractData.domicilioPrestador || '[DOMICILIO COMPLETO DE EL PRESTADOR]'}.`, 10, false, 'justify');
  addSpace();

  addText("II. Declara EL CLIENTE:", 11, true);
  addText("a) Ser una persona física de nacionalidad mexicana, mayor de edad, con plena capacidad legal y facultades para celebrar el presente contrato.", 10, false, 'justify');
  addText("b) Que es su voluntad e interés contratar los servicios de EL PRESTADOR para los fines descritos en el presente documento.", 10, false, 'justify');
  addText(`c) Que su domicilio para los efectos del presente instrumento es ${contractData.domicilioCliente || '[DOMICILIO COMPLETO DE EL CLIENTE]'}.`, 10, false, 'justify');
  addSpace();

  addText("III. Declaran las partes:", 11, true);
  addText("Que es su voluntad celebrar el presente contrato de prestación de servicios profesionales, de conformidad con las siguientes:", 10, false, 'justify');
  addSpace();

  // CLÁUSULAS
  addText("CLÁUSULAS", 12, true, 'center');
  addSpace();

  addText("PRIMERA. OBJETO DEL CONTRATO.", 11, true);
  const objetoText = `EL PRESTADOR se obliga a prestar a EL CLIENTE los siguientes servicios profesionales: ${contractData.servicios || '[DESCRIBIR EL SERVICIO DE MANERA CLARA Y DETALLADA]'}.`;
  addText(objetoText, 10, false, 'justify');
  addSpace();

  addText("SEGUNDA. OBLIGACIONES DE LAS PARTES.", 11, true);
  addText("2.1. Obligaciones de EL PRESTADOR:", 10, true);
  addText("a) Prestar los servicios objeto de este contrato de forma diligente y profesional, utilizando su mejor esfuerzo y conocimientos técnicos.", 10, false, 'justify');
  addText("b) Cumplir con los plazos establecidos en el presente contrato o aquellos que se pacten por escrito.", 10, false, 'justify');
  addText("c) Informar a EL CLIENTE de manera regular sobre el avance de los servicios.", 10, false, 'justify');
  addSpace();

  addText("2.2. Obligaciones de EL CLIENTE:", 10, true);
  addText("a) Proveer a EL PRESTADOR de toda la información, acceso, documentos y recursos necesarios para la correcta ejecución de los servicios.", 10, false, 'justify');
  addText("b) Realizar los pagos correspondientes a los honorarios de EL PRESTADOR en los términos y plazos acordados.", 10, false, 'justify');
  addSpace();

  // TERCERA - Honorarios
  addText("TERCERA. HONORARIOS Y FORMA DE PAGO.", 11, true);
  
  // Calcular monto total si hay facturas
  let montoTotal = 0;
  if (invoicesData && invoicesData.length > 0) {
    montoTotal = invoicesData.reduce((sum, invoice) => sum + (invoice.monto || 0), 0);
  }
  
  const montoTotalText = contractData.montoTotal || (montoTotal > 0 ? `$${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '[CANTIDAD TOTAL CON NÚMERO]');
  const formaPago = contractData.formaPago || (invoicesData && invoicesData.length > 0 ? invoicesData[0].formaPago : 'transferencia bancaria');
  
  const honorariosText = `Por la prestación de los servicios, EL CLIENTE se obliga a pagar a EL PRESTADOR la cantidad total de ${montoTotalText} M.N., más el Impuesto al Valor Agregado (IVA) correspondiente. El pago se realizará mediante ${formaPago}.`;
  addText(honorariosText, 10, false, 'justify');
  
  // Si hay múltiples facturas, agregar fechas de pago
  if (invoicesData && invoicesData.length > 1) {
    addSpace();
    addText("Fechas de pago correspondientes a las facturas:", 10, true);
    invoicesData.forEach((invoice, index) => {
      const fechaPago = invoice.fecha || `Factura ${index + 1}`;
      const monto = invoice.monto ? `$${invoice.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : 'Monto no especificado';
      addText(`- ${fechaPago}: ${monto} (${invoice.fileName || `Factura ${index + 1}`})`, 10, false);
    });
  }
  addSpace();

  // CUARTA - Vigencia
  addText("CUARTA. PLAZO DE VIGENCIA.", 11, true);
  const fechaInicio = contractData.fechaInicio || '[FECHA DE INICIO]';
  const fechaTermino = contractData.fechaTermino === 'otro' ? 
    contractData.fechaTerminoTexto || '[ESPECIFICAR TÉRMINO]' : 
    (contractData.fechaTermino || '[FECHA DE TÉRMINO]');
  
  const vigenciaText = `El presente contrato tendrá vigencia a partir del día ${fechaInicio}${contractData.fechaTermino === 'otro' ? ' ' + fechaTermino : ' y finalizará el día ' + fechaTermino}.`;
  addText(vigenciaText, 10, false, 'justify');
  addSpace();

  // QUINTA - Confidencialidad
  addText("QUINTA. CONFIDENCIALIDAD.", 11, true);
  const confidencialidadText = "Las partes se obligan a guardar estricta confidencialidad respecto de toda la información que se compartan mutuamente para la ejecución de este contrato. Dicha información incluye, pero no se limita a, secretos industriales, procesos, estrategias comerciales, datos de clientes o cualquier otro dato sensible. Esta obligación subsistirá aún después de la terminación del presente contrato.";
  addText(confidencialidadText, 10, false, 'justify');
  addSpace();

  // SEXTA - Propiedad Intelectual
  addText("SEXTA. PROPIEDAD INTELECTUAL.", 11, true);
  const propiedadText = "Los resultados, documentos, diseños, software o cualquier otra obra generada por EL PRESTADOR para la ejecución del servicio objeto de este contrato serán de la exclusiva propiedad de EL CLIENTE, quien podrá utilizarlos y explotarlos sin limitación de tiempo ni de territorio.";
  addText(propiedadText, 10, false, 'justify');
  addSpace();

  // SÉPTIMA - Terminación
  addText("SÉPTIMA. TERMINACIÓN ANTICIPADA.", 11, true);
  const terminacionText = "El presente contrato podrá darse por terminado anticipadamente sin responsabilidad para cualquiera de las partes en los siguientes casos: a) Por mutuo acuerdo, por escrito, de ambas partes. b) Por el incumplimiento de las obligaciones establecidas en este contrato por cualquiera de las partes. En este caso, la parte afectada deberá notificar por escrito a la parte incumplidora, otorgándole un plazo de 15 días para remediar el incumplimiento.";
  addText(terminacionText, 10, false, 'justify');
  addSpace();

  // OCTAVA - Jurisdicción
  addText("OCTAVA. JURISDICCIÓN Y COMPETENCIA.", 11, true);
  const jurisdiccionText = `Para la interpretación y cumplimiento del presente contrato, las partes se someten expresamente a la jurisdicción y competencia de los tribunales de ${contractData.jurisdiccion || '[CIUDAD/ESTADO]'}, renunciando a cualquier otro fuero que pudiera corresponderles en razón de sus domicilios presentes o futuros.`;
  addText(jurisdiccionText, 10, false, 'justify');
  addSpace(15);

  // Firma
  const fechaActual = new Date().toLocaleDateString('es-MX');
  const ciudadFirma = contractData.ciudadFirma || '[CIUDAD]';
  const firmaText = `Leído que fue el presente contrato y enteradas las partes de su contenido y alcance legal, lo firman por duplicado en la ciudad de ${ciudadFirma}, a los ${fechaActual}.`;
  addText(firmaText, 10, false, 'justify');
  addSpace(20);

  // Espacios para firmas
  addText("FIRMAS", 12, true, 'center');
  addSpace(15);

  const nombreFirmaPrestador = contractData.representantePrestador || contractData.prestador || 'NOMBRE COMPLETO DEL PRESTADOR';
  const nombreFirmaCliente = contractData.representanteCliente || contractData.cliente || 'NOMBRE COMPLETO DEL CLIENTE';

  addText("EL PRESTADOR", 11, true, 'center');
  addSpace(15);
  addText(`[${nombreFirmaPrestador}]`, 10, false, 'center');
  if (contractData.representantePrestador) {
    addText(`Representante de: ${contractData.prestador}`, 8, false, 'center');
  }
  addSpace(20);

  addText("EL CLIENTE", 11, true, 'center');
  addSpace(15);
  addText(`[${nombreFirmaCliente}]`, 10, false, 'center');
  if (contractData.representanteCliente) {
    addText(`Representante de: ${contractData.cliente}`, 8, false, 'center');
  }

  return doc;
}

/**
 * Componente para descargar el contrato como PDF
 */
export default function ContractPDFGenerator({ contractData, invoicesData, fileName = "contrato_prestacion_servicios.pdf" }) {
  const handleDownload = () => {
    try {
      const doc = generateContractPDF(contractData, invoicesData);
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF del contrato");
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
    >
      Descargar Contrato PDF
    </button>
  );
}
