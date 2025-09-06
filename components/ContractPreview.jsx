"use client";

export default function ContractPreview({ contractData, invoicesData }) {
  if (!contractData) return null;

  // Calcular monto total si hay facturas
  let montoTotal = 0;
  if (invoicesData && invoicesData.length > 0) {
    montoTotal = invoicesData.reduce((sum, invoice) => sum + (invoice.monto || 0), 0);
  }

  const montoTotalText = contractData.montoTotal || 
    (montoTotal > 0 ? `$${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '[CANTIDAD TOTAL CON NÚMERO]');
  
  const formaPago = contractData.formaPago || 
    (invoicesData && invoicesData.length > 0 ? invoicesData[0].formaPago : 'transferencia bancaria');

  const fechaInicio = contractData.fechaInicio || '[FECHA DE INICIO]';
  const fechaTermino = contractData.fechaTermino === 'otro' ? 
    contractData.fechaTerminoTexto || '[ESPECIFICAR TÉRMINO]' : 
    (contractData.fechaTermino || '[FECHA DE TÉRMINO]');

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <div className="space-y-4 text-sm leading-6 text-gray-800 dark:text-gray-200">
        
        {/* Título */}
        <div className="text-center">
          <h2 className="text-xl font-bold uppercase">
            Contrato de Prestación de Servicios Profesionales
          </h2>
        </div>

        {/* Introducción */}
        <p className="text-justify">
          que celebran, por una parte, <strong>{contractData.prestador || '[NOMBRE COMPLETO DEL PRESTADOR DE SERVICIOS]'}</strong>, 
          por su propio derecho, en adelante denominado como <strong>EL PRESTADOR</strong>, y por la otra, <strong>{contractData.cliente || '[NOMBRE COMPLETO DEL CLIENTE]'}</strong>, 
          por su propio derecho, en adelante denominado como <strong>EL CLIENTE</strong>, al tenor de las siguientes:
        </p>

        {/* Declaraciones */}
        <div>
          <h3 className="text-lg font-bold text-center mb-4">DECLARACIONES</h3>
          
          <div className="space-y-3">
            <div>
              <p className="font-semibold">I. Declara EL PRESTADOR:</p>
              <div className="ml-4 space-y-2">
                <p>a) Ser una persona física de nacionalidad mexicana, mayor de edad, con plena capacidad legal para celebrar el presente contrato.</p>
                <p>b) Contar con los conocimientos, experiencia, herramientas y habilidades necesarias para prestar los servicios objeto de este contrato.</p>
                <p>c) Que su domicilio para los efectos del presente instrumento es <strong>{contractData.domicilioPrestador || '[DOMICILIO COMPLETO DE EL PRESTADOR]'}</strong>.</p>
              </div>
            </div>

            <div>
              <p className="font-semibold">II. Declara EL CLIENTE:</p>
              <div className="ml-4 space-y-2">
                <p>a) Ser una persona física de nacionalidad mexicana, mayor de edad, con plena capacidad legal y facultades para celebrar el presente contrato.</p>
                <p>b) Que es su voluntad e interés contratar los servicios de EL PRESTADOR para los fines descritos en el presente documento.</p>
                <p>c) Que su domicilio para los efectos del presente instrumento es <strong>{contractData.domicilioCliente || '[DOMICILIO COMPLETO DE EL CLIENTE]'}</strong>.</p>
              </div>
            </div>

            <div>
              <p className="font-semibold">III. Declaran las partes:</p>
              <p className="ml-4">Que es su voluntad celebrar el presente contrato de prestación de servicios profesionales, de conformidad con las siguientes:</p>
            </div>
          </div>
        </div>

        {/* Cláusulas */}
        <div>
          <h3 className="text-lg font-bold text-center mb-4">CLÁUSULAS</h3>
          
          <div className="space-y-4">
            {/* Primera */}
            <div>
              <p className="font-semibold">PRIMERA. OBJETO DEL CONTRATO.</p>
              <p className="ml-4 text-justify">
                EL PRESTADOR se obliga a prestar a EL CLIENTE los siguientes servicios profesionales: <strong>{contractData.servicios || '[DESCRIBIR EL SERVICIO DE MANERA CLARA Y DETALLADA]'}</strong>.
              </p>
            </div>

            {/* Segunda */}
            <div>
              <p className="font-semibold">SEGUNDA. OBLIGACIONES DE LAS PARTES.</p>
              <div className="ml-4 space-y-2">
                <div>
                  <p className="font-medium">2.1. Obligaciones de EL PRESTADOR:</p>
                  <div className="ml-4 space-y-1">
                    <p>a) Prestar los servicios objeto de este contrato de forma diligente y profesional, utilizando su mejor esfuerzo y conocimientos técnicos.</p>
                    <p>b) Cumplir con los plazos establecidos en el presente contrato o aquellos que se pacten por escrito.</p>
                    <p>c) Informar a EL CLIENTE de manera regular sobre el avance de los servicios.</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">2.2. Obligaciones de EL CLIENTE:</p>
                  <div className="ml-4 space-y-1">
                    <p>a) Proveer a EL PRESTADOR de toda la información, acceso, documentos y recursos necesarios para la correcta ejecución de los servicios.</p>
                    <p>b) Realizar los pagos correspondientes a los honorarios de EL PRESTADOR en los términos y plazos acordados.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tercera */}
            <div>
              <p className="font-semibold">TERCERA. HONORARIOS Y FORMA DE PAGO.</p>
              <p className="ml-4 text-justify">
                Por la prestación de los servicios, EL CLIENTE se obliga a pagar a EL PRESTADOR la cantidad total de <strong>{montoTotalText}</strong> M.N., 
                más el Impuesto al Valor Agregado (IVA) correspondiente. El pago se realizará mediante <strong>{formaPago}</strong>.
              </p>
              
              {/* Si hay múltiples facturas, mostrar fechas de pago */}
              {invoicesData && invoicesData.length > 1 && (
                <div className="ml-4 mt-3">
                  <p className="font-medium">Fechas de pago correspondientes a las facturas:</p>
                  <ul className="ml-4 mt-2 space-y-1">
                    {invoicesData.map((invoice, index) => (
                      <li key={index} className="flex justify-between">
                        <span>• {invoice.fecha || `Factura ${index + 1}`}:</span>
                        <span>
                          <strong>
                            {invoice.monto ? 
                              `$${invoice.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : 
                              'Monto no especificado'
                            }
                          </strong>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            ({invoice.fileName || `Factura ${index + 1}`})
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Cuarta */}
            <div>
              <p className="font-semibold">CUARTA. PLAZO DE VIGENCIA.</p>
              <p className="ml-4 text-justify">
                El presente contrato tendrá vigencia a partir del día <strong>{fechaInicio}</strong>
                {contractData.fechaTermino === 'otro' ? 
                  ` ${fechaTermino}` : 
                  ` y finalizará el día ${fechaTermino}`
                }.
              </p>
            </div>

            {/* Quinta */}
            <div>
              <p className="font-semibold">QUINTA. CONFIDENCIALIDAD.</p>
              <p className="ml-4 text-justify">
                Las partes se obligan a guardar estricta confidencialidad respecto de toda la información que se compartan mutuamente 
                para la ejecución de este contrato. Dicha información incluye, pero no se limita a, secretos industriales, procesos, 
                estrategias comerciales, datos de clientes o cualquier otro dato sensible. Esta obligación subsistirá aún después de 
                la terminación del presente contrato.
              </p>
            </div>

            {/* Sexta */}
            <div>
              <p className="font-semibold">SEXTA. PROPIEDAD INTELECTUAL.</p>
              <p className="ml-4 text-justify">
                Los resultados, documentos, diseños, software o cualquier otra obra generada por EL PRESTADOR para la ejecución del 
                servicio objeto de este contrato serán de la exclusiva propiedad de EL CLIENTE, quien podrá utilizarlos y explotarlos 
                sin limitación de tiempo ni de territorio.
              </p>
            </div>

            {/* Séptima */}
            <div>
              <p className="font-semibold">SÉPTIMA. TERMINACIÓN ANTICIPADA.</p>
              <p className="ml-4 text-justify">
                El presente contrato podrá darse por terminado anticipadamente sin responsabilidad para cualquiera de las partes en los 
                siguientes casos: a) Por mutuo acuerdo, por escrito, de ambas partes. b) Por el incumplimiento de las obligaciones 
                establecidas en este contrato por cualquiera de las partes. En este caso, la parte afectada deberá notificar por escrito 
                a la parte incumplidora, otorgándole un plazo de 15 días para remediar el incumplimiento.
              </p>
            </div>

            {/* Octava */}
            <div>
              <p className="font-semibold">OCTAVA. JURISDICCIÓN Y COMPETENCIA.</p>
              <p className="ml-4 text-justify">
                Para la interpretación y cumplimiento del presente contrato, las partes se someten expresamente a la jurisdicción y 
                competencia de los tribunales de <strong>{contractData.jurisdiccion || '[CIUDAD/ESTADO]'}</strong>, renunciando a 
                cualquier otro fuero que pudiera corresponderles en razón de sus domicilios presentes o futuros.
              </p>
            </div>
          </div>
        </div>

        {/* Firma */}
        <div className="pt-6">
          <p className="text-justify mb-6">
            Leído que fue el presente contrato y enteradas las partes de su contenido y alcance legal, lo firman por duplicado 
            en la ciudad de <strong>{contractData.ciudadFirma || '[CIUDAD]'}</strong>, a los <strong>{new Date().toLocaleDateString('es-MX')}</strong>.
          </p>
          
          <div className="text-center space-y-8">
            <h4 className="font-bold">FIRMAS</h4>
            
            <div className="flex justify-around">
              <div className="text-center">
                <div className="border-t border-gray-400 w-48 mb-2"></div>
                <p className="font-semibold">EL PRESTADOR</p>
                <p className="text-sm">
                  [{contractData.representantePrestador || contractData.prestador || 'NOMBRE COMPLETO DEL PRESTADOR'}]
                </p>
                {contractData.representantePrestador && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Representante de: {contractData.prestador}
                  </p>
                )}
              </div>
              
              <div className="text-center">
                <div className="border-t border-gray-400 w-48 mb-2"></div>
                <p className="font-semibold">EL CLIENTE</p>
                <p className="text-sm">
                  [{contractData.representanteCliente || contractData.cliente || 'NOMBRE COMPLETO DEL CLIENTE'}]
                </p>
                {contractData.representanteCliente && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Representante de: {contractData.cliente}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
