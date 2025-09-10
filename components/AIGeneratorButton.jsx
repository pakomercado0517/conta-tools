"use client";
import { useState, useEffect } from 'react';
import { Button, Spinner, Alert } from 'flowbite-react';
import { BsStars, BsX } from 'react-icons/bs';
import useAIGenerator from '@/hooks/useAIGenerator';

export default function AIGeneratorButton({
  type = 'quotation', // 'quotation' | 'contract' | 'custom'
  concept = '', // El concepto base del usuario
  onGenerated = () => {}, // Callback cuando se genera contenido
  placeholder = 'Ingrese un concepto...',
  disabled = false,
  className = ''
}) {
  const [showModal, setShowModal] = useState(false);
  const [tempConcept, setTempConcept] = useState(concept);
  const [generatedResult, setGeneratedResult] = useState('');

  const {
    isLoading,
    error,
    generateQuotationConcept,
    generateContractConcept,
    clearState
  } = useAIGenerator();

  // Update tempConcept when concept prop changes
  useEffect(() => {
    setTempConcept(concept);
  }, [concept]);

  // Modal management for iOS
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

  const handleGenerate = async () => {
    if (!tempConcept.trim()) {
      return;
    }

    clearState();
    let result;

    if (type === 'quotation') {
      result = await generateQuotationConcept(tempConcept);
    } else if (type === 'contract') {
      result = await generateContractConcept(tempConcept);
    }

    if (result.success) {
      setGeneratedResult(result.data);
    }
  };

  const handleApply = () => {
    onGenerated(generatedResult);
    setShowModal(false);
    setGeneratedResult('');
  };

  const handleCancel = () => {
    setShowModal(false);
    setGeneratedResult('');
    clearState();
  };

  const handleModalClick = (e) => {
    // Solo cerrar si se hace click en el backdrop, no en el contenido
    if (e.target === e.currentTarget) {
      handleCancel();
    }
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
          className="fixed inset-0 z-[10000] bg-black bg-opacity-50"
          style={{
            // Importante para iOS: usar viewport units
            minHeight: '100vh',
            minHeight: '-webkit-fill-available'
          }}
          onClick={handleModalClick}
        >
          <div className="flex items-start justify-center min-h-full px-4 pt-4 pb-20">
            <div 
              className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mt-8"
              onClick={(e) => e.stopPropagation()}
              style={{
                // Para iOS: asegurar que el modal sea scrolleable si es necesario
                maxHeight: 'calc(100vh - 64px)',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <BsStars className="text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Generador de Contenido con IA
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <BsX className="text-2xl" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                {/* Input para el concepto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concepto base:
                  </label>
                  <input
                    type="text"
                    value={tempConcept}
                    onChange={(e) => setTempConcept(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
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
                    <label className="block text-sm font-medium text-gray-700">
                      Contenido generado:
                    </label>
                    <div className="p-4 bg-gray-50 rounded-md border max-h-40 overflow-y-auto">
                      <p className="text-gray-800 leading-relaxed text-sm">
                        {generatedResult}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-3 p-4 border-t border-gray-200 sm:flex-row sm:justify-end">
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
