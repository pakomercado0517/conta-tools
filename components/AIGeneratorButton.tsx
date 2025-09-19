"use client";

import { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import { Button, Spinner, Alert } from 'flowbite-react';
import { BsStars, BsX } from 'react-icons/bs';
import useAIGenerator from '@/hooks/useAIGenerator';

// Tipos para los diferentes modos de generación de IA
type AIGeneratorType = 'quotation' | 'contract' | 'contract-object' | 'custom';

// Tipos para tipo de producto en contratos
type TipoProducto = 'venta' | 'servicio';

// Interface para las props del componente
interface AIGeneratorButtonProps {
  type?: AIGeneratorType;
  concept?: string;
  tipoProducto?: TipoProducto;
  onGenerated?: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Componente botón generador de contenido con IA
 * Proporciona una interfaz modal para generar contenido usando diferentes tipos de IA
 * 
 * @param type - Tipo de generación: 'quotation', 'contract', 'contract-object', 'custom'
 * @param concept - Concepto base del usuario
 * @param tipoProducto - Tipo de producto para contratos: 'venta' o 'servicio'
 * @param onGenerated - Callback que se ejecuta cuando se genera contenido
 * @param placeholder - Placeholder para el input
 * @param disabled - Si el botón está deshabilitado
 * @param className - Clases CSS adicionales
 */
export default function AIGeneratorButton({
  type = 'quotation',
  concept = '',
  tipoProducto = 'venta',
  onGenerated = () => {},
  placeholder = 'Ingrese un concepto...',
  disabled = false,
  className = ''
}: AIGeneratorButtonProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [tempConcept, setTempConcept] = useState<string>(concept);
  const [generatedResult, setGeneratedResult] = useState<string>('');

  const {
    isLoading,
    error,
    generateQuotationConcept,
    generateContractConcept,
    generateContractObject,
    clearState
  } = useAIGenerator();

  /**
   * Actualizar tempConcept cuando cambie la prop concept
   */
  useEffect(() => {
    setTempConcept(concept);
  }, [concept]);

  /**
   * Manejo del modal para iOS - prevenir scroll del body
   */
  useEffect(() => {
    if (showModal) {
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
      // Para iOS: también prevenir touch events en el body
      document.body.style.touchAction = 'none';
    } else {
      // Restaurar scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
    };
  }, [showModal]);

  /**
   * Maneja la generación de contenido con IA según el tipo
   */
  const handleGenerate = async (): Promise<void> => {
    if (!tempConcept.trim()) {
      return;
    }

    clearState();
    let result;

    if (type === 'quotation') {
      result = await generateQuotationConcept(tempConcept);
    } else if (type === 'contract') {
      result = await generateContractConcept(tempConcept);
    } else if (type === 'contract-object') {
      result = await generateContractObject(tempConcept, tipoProducto);
    }

    if (result && result.success && result.data) {
      setGeneratedResult(result.data);
    }
  };

  /**
   * Aplicar el contenido generado y cerrar modal
   */
  const handleApply = (): void => {
    onGenerated(generatedResult);
    setShowModal(false);
    setGeneratedResult('');
  };

  /**
   * Cancelar y limpiar estado
   */
  const handleCancel = (): void => {
    setShowModal(false);
    setGeneratedResult('');
    clearState();
  };

  /**
   * Manejar click en el backdrop del modal
   */
  const handleModalClick = (e: MouseEvent<HTMLDivElement>): void => {
    // Solo cerrar si se hace click en el backdrop, no en el contenido
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  /**
   * Manejar cambio en el input del concepto
   */
  const handleConceptChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setTempConcept(e.target.value);
  };

  /**
   * Prevenir propagación del click en el contenido del modal
   */
  const handleContentClick = (e: MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
  };

  return (
    <>
      <Button
        size="sm"
        color="purple"
        onClick={() => setShowModal(true)}
        disabled={disabled || isLoading}
        className={`flex items-center gap-2 ${className}`}
      >
        <BsStars className="text-lg" />
        IA
      </Button>

      {/* Modal personalizado para iOS */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[10000] bg-black bg-opacity-50 min-h-screen"
          style={{
            // Importante para iOS: usar viewport units
            minHeight: '-webkit-fill-available'
          }}
          onClick={handleModalClick}
        >
          <div className="flex items-start justify-center min-h-full px-4 pt-4 pb-20">
            <div 
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mt-8"
              onClick={handleContentClick}
              style={{
                // Para iOS: asegurar que el modal sea scrolleable si es necesario
                maxHeight: 'calc(100vh - 64px)',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2">
                  <BsStars className="text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Generador de Contenido con IA
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                  aria-label="Cerrar modal"
                >
                  <BsX className="text-2xl" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                {/* Input para el concepto */}
                <div>
                  <label 
                    htmlFor="ai-concept-input"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Concepto base:
                  </label>
                  <input
                    id="ai-concept-input"
                    type="text"
                    value={tempConcept}
                    onChange={handleConceptChange}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isLoading}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    // iOS specific: prevent zoom on focus
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* Botón generar */}
                <Button
                  onClick={handleGenerate}
                  disabled={!tempConcept.trim() || isLoading}
                  color="purple"
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      Generando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <BsStars />
                      Generar con IA
                    </div>
                  )}
                </Button>

                {/* Mostrar errores */}
                {error && (
                  <Alert color="failure">
                    <span className="font-medium">Error:</span> {error}
                  </Alert>
                )}

                {/* Mostrar resultado */}
                {generatedResult && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contenido generado:
                    </label>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-600 max-h-40 overflow-y-auto">
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                        {generatedResult}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-3 p-4 border-t border-gray-200 dark:border-gray-600 sm:flex-row sm:justify-end">
                <Button 
                  color="gray" 
                  onClick={handleCancel}
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  Cancelar
                </Button>
                {generatedResult && (
                  <Button 
                    onClick={handleApply} 
                    color="purple"
                    className="w-full sm:w-auto"
                    size="lg"
                  >
                    Aplicar Contenido
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}