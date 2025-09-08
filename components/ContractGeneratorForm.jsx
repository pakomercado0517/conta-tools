"use client";

import { useState } from "react";
import { Button, Card, TextInput, Label, Textarea } from "flowbite-react";
import { FaEye } from "react-icons/fa";
import ContractPreview from "./ContractPreview";
import ContractPDFGenerator from "./ContractPDFGenerator";

export default function ContractGeneratorForm() {
  const [contractData, setContractData] = useState({
    // Datos básicos (Vendedor = Prestador)
    prestador: "",
    cliente: "",
    representantePrestador: "",
    representanteCliente: "",
    domicilioPrestador: "",
    domicilioCliente: "",
    
    // Régimen fiscal
    regimenVendedor: "Persona Física",
    regimenVendedorCustom: "",
    regimenComprador: "Persona Física", 
    regimenCompradorCustom: "",
    
    // Objeto del contrato
    servicios: "",
    
    // Fechas
    fechaInicio: "",
    fechaTermino: "",
    fechaTerminoTexto: "",
    fechaFirma: "",
    
    // Información de pago
    montoTotal: "",
    formaPago: "",
    
    // Datos bancarios
    banco: "",
    titularCuenta: "",
    numeroCuenta: "",
    clabeInterbancaria: "",
    
    // Datos bancarios - opciones
    usarNombreVendedorComoTitular: false,
    
    // Jurisdicción y firma
    jurisdiccion: "",
    ciudadFirma: "",
    
    // Firmas personalizadas e imágenes
    firmaVendedor: "",
    firmaComprador: "",
    imagenFirmaVendedor: null,
    imagenFirmaComprador: null,
  });
  
  const [showPreview, setShowPreview] = useState(false);


  // Manejar cambios en los campos del formulario
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setContractData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Si se está cambiando el nombre del prestador y la opción de usar como titular está activa
      if (name === 'prestador' && prev.usarNombreVendedorComoTitular) {
        newData.titularCuenta = value;
      }
      
      return newData;
    });
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

  // Manejar checkbox de titular de cuenta
  const handleTitularCheckboxChange = (event) => {
    const isChecked = event.target.checked;
    setContractData(prev => ({
      ...prev,
      usarNombreVendedorComoTitular: isChecked,
      titularCuenta: isChecked ? prev.prestador : ""
    }));
  };

  // Manejar carga de imágenes de firma
  const handleImagenFirmaChange = (event, tipo) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setContractData(prev => ({
          ...prev,
          [tipo]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
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
           hasFechaTermino &&
           contractData.montoTotal.trim() !== "" &&
           contractData.formaPago.trim() !== "" &&
           contractData.jurisdiccion.trim() !== "" &&
           contractData.ciudadFirma.trim() !== "";
  };

  return (
    <div className="space-y-8">
      {/* Sección de datos del contrato */}
      <Card>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            1. Datos de las Partes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos del Vendedor (Prestador) */}
            <div>
              <Label htmlFor="prestador" value="Nombre del Vendedor *" />
              <TextInput
                id="prestador"
                name="prestador"
                value={contractData.prestador}
                onChange={handleInputChange}
                placeholder="Nombre completo del vendedor"
                required
              />
            </div>

            <div>
              <Label htmlFor="cliente" value="Nombre del Comprador *" />
              <TextInput
                id="cliente"
                name="cliente"
                value={contractData.cliente}
                onChange={handleInputChange}
                placeholder="Nombre completo del comprador"
                required
              />
            </div>

            <div>
              <Label htmlFor="representantePrestador" value="Representante del Vendedor (opcional)" />
              <TextInput
                id="representantePrestador"
                name="representantePrestador"
                value={contractData.representantePrestador}
                onChange={handleInputChange}
                placeholder="Nombre del representante legal del vendedor"
              />
            </div>

            <div>
              <Label htmlFor="representanteCliente" value="Representante del Comprador (opcional)" />
              <TextInput
                id="representanteCliente"
                name="representanteCliente"
                value={contractData.representanteCliente}
                onChange={handleInputChange}
                placeholder="Nombre del representante legal del comprador"
              />
            </div>

            <div>
              <Label htmlFor="domicilioPrestador" value="Domicilio del Vendedor" />
              <TextInput
                id="domicilioPrestador"
                name="domicilioPrestador"
                value={contractData.domicilioPrestador}
                onChange={handleInputChange}
                placeholder="Domicilio completo del vendedor"
              />
            </div>

            <div>
              <Label htmlFor="domicilioCliente" value="Domicilio del Comprador" />
              <TextInput
                id="domicilioCliente"
                name="domicilioCliente"
                value={contractData.domicilioCliente}
                onChange={handleInputChange}
                placeholder="Domicilio completo del comprador"
              />
            </div>

            {/* Régimen Fiscal del Vendedor */}
            <div className="space-y-2">
              <Label value="Régimen Fiscal del Vendedor" />
              <select
                name="regimenVendedor"
                value={contractData.regimenVendedor}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="Persona Física">Persona Física</option>
                <option value="Persona Moral">Persona Moral</option>
                <option value="Persona Física con Actividad Empresarial">Persona Física con Actividad Empresarial</option>
                <option value="Régimen de Incorporación Fiscal">Régimen de Incorporación Fiscal</option>
                <option value="Régimen Simplificado de Confianza">Régimen Simplificado de Confianza</option>
                <option value="Otro">Otro (personalizado)</option>
              </select>
              
              {contractData.regimenVendedor === "Otro" && (
                <TextInput
                  name="regimenVendedorCustom"
                  value={contractData.regimenVendedorCustom}
                  onChange={handleInputChange}
                  placeholder="Especifica el régimen fiscal del vendedor"
                />
              )}
            </div>

            {/* Régimen Fiscal del Comprador */}
            <div className="space-y-2">
              <Label value="Régimen Fiscal del Comprador" />
              <select
                name="regimenComprador"
                value={contractData.regimenComprador}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="Persona Física">Persona Física</option>
                <option value="Persona Moral">Persona Moral</option>
                <option value="Persona Física con Actividad Empresarial">Persona Física con Actividad Empresarial</option>
                <option value="Régimen de Incorporación Fiscal">Régimen de Incorporación Fiscal</option>
                <option value="Régimen Simplificado de Confianza">Régimen Simplificado de Confianza</option>
                <option value="Otro">Otro (personalizado)</option>
              </select>
              
              {contractData.regimenComprador === "Otro" && (
                <TextInput
                  name="regimenCompradorCustom"
                  value={contractData.regimenCompradorCustom}
                  onChange={handleInputChange}
                  placeholder="Especifica el régimen fiscal del comprador"
                />
              )}
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

            <div>
              <Label htmlFor="fechaFirma" value="Fecha de Firma" />
              <TextInput
                id="fechaFirma"
                name="fechaFirma"
                type="date"
                value={contractData.fechaFirma}
                onChange={handleInputChange}
                placeholder="Fecha en que se firmará el contrato"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Sección de información económica */}
      <Card>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            2. Información de Pago
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="montoTotal" value="Monto Total *" />
              <TextInput
                id="montoTotal"
                name="montoTotal"
                value={contractData.montoTotal}
                onChange={handleInputChange}
                placeholder="Ej: $39,500.00"
                required
              />
            </div>


            <div>
              <Label htmlFor="formaPago" value="Forma de Pago *" />
              <TextInput
                id="formaPago"
                name="formaPago"
                value={contractData.formaPago}
                onChange={handleInputChange}
                placeholder="Ej: Transferencia Electrónica"
                required
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Sección de datos bancarios */}
      <Card>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            3. Datos Bancarios para el Pago
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="banco" value="Banco" />
              <TextInput
                id="banco"
                name="banco"
                value={contractData.banco}
                onChange={handleInputChange}
                placeholder="Ej: BanBajío"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="titularCuenta" value="Titular de la Cuenta" />
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="usarNombreVendedorComoTitular"
                    checked={contractData.usarNombreVendedorComoTitular}
                    onChange={handleTitularCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="usarNombreVendedorComoTitular" className="text-sm text-gray-700 dark:text-gray-300">
                    Usar el mismo nombre del vendedor
                  </label>
                </div>
                <TextInput
                  id="titularCuenta"
                  name="titularCuenta"
                  value={contractData.titularCuenta}
                  onChange={handleInputChange}
                  placeholder="Nombre del titular de la cuenta"
                  disabled={contractData.usarNombreVendedorComoTitular}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="numeroCuenta" value="Número de Cuenta" />
              <TextInput
                id="numeroCuenta"
                name="numeroCuenta"
                value={contractData.numeroCuenta}
                onChange={handleInputChange}
                placeholder="Ej: 447641400201"
              />
            </div>

            <div>
              <Label htmlFor="clabeInterbancaria" value="CLABE Interbancaria" />
              <TextInput
                id="clabeInterbancaria"
                name="clabeInterbancaria"
                value={contractData.clabeInterbancaria}
                onChange={handleInputChange}
                placeholder="Ej: 030903900041089202"
              />
            </div>

          </div>
        </div>
      </Card>

      {/* Sección de jurisdicción y firmas */}
      <Card>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            4. Jurisdicción y Firmas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="jurisdiccion" value="Jurisdicción *" />
              <TextInput
                id="jurisdiccion"
                name="jurisdiccion"
                value={contractData.jurisdiccion}
                onChange={handleInputChange}
                placeholder="Ej: Tuxpan de Rodríguez Cano, Veracruz"
                required
              />
            </div>

            <div>
              <Label htmlFor="ciudadFirma" value="Ciudad de Firma *" />
              <TextInput
                id="ciudadFirma"
                name="ciudadFirma"
                value={contractData.ciudadFirma}
                onChange={handleInputChange}
                placeholder="Ej: Tuxpan de Rodríguez Cano, Veracruz"
                required
              />
            </div>

            <div>
              <Label htmlFor="firmaVendedor" value="Texto de Firma del Vendedor (opcional)" />
              <TextInput
                id="firmaVendedor"
                name="firmaVendedor"
                value={contractData.firmaVendedor}
                onChange={handleInputChange}
                placeholder="Texto personalizado para la firma del vendedor"
              />
            </div>

            <div>
              <Label htmlFor="firmaComprador" value="Texto de Firma del Comprador (opcional)" />
              <TextInput
                id="firmaComprador"
                name="firmaComprador"
                value={contractData.firmaComprador}
                onChange={handleInputChange}
                placeholder="Texto personalizado para la firma del comprador"
              />
            </div>
          </div>
          
          {/* Carga de imágenes de firma */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label value="Imagen de Firma del Vendedor (opcional)" />
              <div className="flex items-center justify-center w-full">
                <label htmlFor="imagenFirmaVendedor" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                  {contractData.imagenFirmaVendedor ? (
                    <img 
                      src={contractData.imagenFirmaVendedor} 
                      alt="Firma Vendedor" 
                      className="max-h-28 max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click para subir</span> imagen de firma
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, JPEG (MAX. 2MB)</p>
                    </div>
                  )}
                  <input 
                    id="imagenFirmaVendedor" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImagenFirmaChange(e, 'imagenFirmaVendedor')}
                  />
                </label>
              </div>
              {contractData.imagenFirmaVendedor && (
                <button
                  type="button"
                  onClick={() => setContractData(prev => ({ ...prev, imagenFirmaVendedor: null }))}
                  className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                >
                  Eliminar imagen
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <Label value="Imagen de Firma del Comprador (opcional)" />
              <div className="flex items-center justify-center w-full">
                <label htmlFor="imagenFirmaComprador" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                  {contractData.imagenFirmaComprador ? (
                    <img 
                      src={contractData.imagenFirmaComprador} 
                      alt="Firma Comprador" 
                      className="max-h-28 max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click para subir</span> imagen de firma
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, JPEG (MAX. 2MB)</p>
                    </div>
                  )}
                  <input 
                    id="imagenFirmaComprador" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImagenFirmaChange(e, 'imagenFirmaComprador')}
                  />
                </label>
              </div>
              {contractData.imagenFirmaComprador && (
                <button
                  type="button"
                  onClick={() => setContractData(prev => ({ ...prev, imagenFirmaComprador: null }))}
                  className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                >
                  Eliminar imagen
                </button>
              )}
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
