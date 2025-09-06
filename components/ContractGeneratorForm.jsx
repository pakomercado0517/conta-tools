"use client";

import { useState } from "react";
import { Button, Card, TextInput, Label, Textarea } from "flowbite-react";
import { FaEye } from "react-icons/fa";
import ContractPreview from "./ContractPreview";
import ContractPDFGenerator from "./ContractPDFGenerator";

export default function ContractGeneratorForm() {
  const [contractData, setContractData] = useState({
    prestador: "",
    cliente: "",
    representantePrestador: "",
    representanteCliente: "",
    domicilioPrestador: "",
    domicilioCliente: "",
    servicios: "",
    fechaInicio: "",
    fechaTermino: "",
    fechaTerminoTexto: "",
    montoTotal: "",
    formaPago: "",
    jurisdiccion: "",
    ciudadFirma: "",
  });
  
  const [showPreview, setShowPreview] = useState(false);


  // Manejar cambios en los campos del formulario
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setContractData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar tipo de fecha de término
  const handleFechaTerminoChange = (event) => {
    const value = event.target.value;
    if (value === "otro") {
      setContractData(prev => ({
        ...prev,
        fechaTermino: "otro",
        fechaTerminoTexto: ""
      }));
    } else {
      setContractData(prev => ({
        ...prev,
        fechaTermino: "",
        fechaTerminoTexto: ""
      }));
    }
  };


  // Validar formulario
  const isFormValid = () => {
    const hasFechaTermino = contractData.fechaTermino === "otro" ? 
      contractData.fechaTerminoTexto.trim() !== "" : 
      contractData.fechaTermino !== "";
    
    return contractData.prestador.trim() !== "" && 
           contractData.cliente.trim() !== "" && 
           contractData.servicios.trim() !== "" && 
           contractData.fechaInicio &&
           hasFechaTermino;
  };

  return (
    <div className="space-y-8">
      {/* Sección de datos del contrato */}
      <Card>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            1. Datos del Contrato
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos de las partes */}
            <div>
              <Label htmlFor="prestador" value="Nombre del Prestador *" />
              <TextInput
                id="prestador"
                name="prestador"
                value={contractData.prestador}
                onChange={handleInputChange}
                placeholder="Nombre completo del prestador de servicios"
                required
              />
            </div>

            <div>
              <Label htmlFor="cliente" value="Nombre del Cliente *" />
              <TextInput
                id="cliente"
                name="cliente"
                value={contractData.cliente}
                onChange={handleInputChange}
                placeholder="Nombre completo del cliente"
                required
              />
            </div>

            <div>
              <Label htmlFor="representantePrestador" value="Representante del Prestador (opcional)" />
              <TextInput
                id="representantePrestador"
                name="representantePrestador"
                value={contractData.representantePrestador}
                onChange={handleInputChange}
                placeholder="Nombre del representante legal (si aplica)"
              />
            </div>

            <div>
              <Label htmlFor="representanteCliente" value="Representante del Cliente (opcional)" />
              <TextInput
                id="representanteCliente"
                name="representanteCliente"
                value={contractData.representanteCliente}
                onChange={handleInputChange}
                placeholder="Nombre del representante legal (si aplica)"
              />
            </div>

            <div>
              <Label htmlFor="domicilioPrestador" value="Domicilio del Prestador" />
              <TextInput
                id="domicilioPrestador"
                name="domicilioPrestador"
                value={contractData.domicilioPrestador}
                onChange={handleInputChange}
                placeholder="Domicilio completo del prestador"
              />
            </div>

            <div>
              <Label htmlFor="domicilioCliente" value="Domicilio del Cliente" />
              <TextInput
                id="domicilioCliente"
                name="domicilioCliente"
                value={contractData.domicilioCliente}
                onChange={handleInputChange}
                placeholder="Domicilio completo del cliente"
              />
            </div>

            {/* Fechas */}
            <div>
              <Label htmlFor="fechaInicio" value="Fecha de Inicio *" />
              <TextInput
                id="fechaInicio"
                name="fechaInicio"
                type="date"
                value={contractData.fechaInicio}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label value="Fecha de Término *" />
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipoFechaTermino"
                      value="fecha"
                      checked={contractData.fechaTermino !== "otro"}
                      onChange={handleFechaTerminoChange}
                      className="mr-2"
                    />
                    Fecha específica
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipoFechaTermino"
                      value="otro"
                      checked={contractData.fechaTermino === "otro"}
                      onChange={handleFechaTerminoChange}
                      className="mr-2"
                    />
                    Otro
                  </label>
                </div>
                {contractData.fechaTermino === "otro" ? (
                  <TextInput
                    name="fechaTerminoTexto"
                    type="text"
                    value={contractData.fechaTerminoTexto}
                    onChange={handleInputChange}
                    placeholder="Ej: por tiempo indefinido, hasta terminar el proyecto, etc."
                  />
                ) : (
                  <TextInput
                    name="fechaTermino"
                    type="date"
                    value={contractData.fechaTermino === "otro" ? "" : contractData.fechaTermino}
                    onChange={handleInputChange}
                  />
                )}
              </div>
            </div>

            {/* Datos adicionales */}
            <div>
              <Label htmlFor="formaPago" value="Forma de Pago (opcional)" />
              <TextInput
                id="formaPago"
                name="formaPago"
                value={contractData.formaPago}
                onChange={handleInputChange}
                placeholder="Ej: Transferencia bancaria, Efectivo, etc."
              />
            </div>

            <div>
              <Label htmlFor="montoTotal" value="Monto Total (opcional)" />
              <TextInput
                id="montoTotal"
                name="montoTotal"
                value={contractData.montoTotal}
                onChange={handleInputChange}
                placeholder="Ej: $50,000.00"
              />
            </div>

            <div>
              <Label htmlFor="jurisdiccion" value="Jurisdicción" />
              <TextInput
                id="jurisdiccion"
                name="jurisdiccion"
                value={contractData.jurisdiccion}
                onChange={handleInputChange}
                placeholder="Ej: Ciudad de México"
              />
            </div>

            <div>
              <Label htmlFor="ciudadFirma" value="Ciudad de Firma" />
              <TextInput
                id="ciudadFirma"
                name="ciudadFirma"
                value={contractData.ciudadFirma}
                onChange={handleInputChange}
                placeholder="Ej: Ciudad de México"
              />
            </div>
          </div>

          {/* Descripción de servicios */}
          <div>
            <Label htmlFor="servicios" value="Descripción de los Servicios *" />
            <Textarea
              id="servicios"
              name="servicios"
              value={contractData.servicios}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe de manera clara y detallada los servicios que se prestarán..."
              required
            />
          </div>
        </div>
      </Card>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          color="info"
          onClick={() => setShowPreview(!showPreview)}
          disabled={!isFormValid()}
        >
          <FaEye className="mr-2" />
          {showPreview ? "Ocultar Vista Previa" : "Ver Vista Previa"}
        </Button>

        <ContractPDFGenerator
          contractData={contractData}
          invoicesData={[]}
        />
      </div>

      {/* Vista previa del contrato */}
      {showPreview && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
            Vista Previa del Contrato
          </h3>
          <ContractPreview contractData={contractData} invoicesData={[]} />
        </div>
      )}
    </div>
  );
}
