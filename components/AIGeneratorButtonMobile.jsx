"use client";
import { useState, useEffect } from 'react';
import { Button, Spinner, Alert } from 'flowbite-react';
import { BsStars, BsX } from 'react-icons/bs';
import useAIGenerator from '@/hooks/useAIGenerator';

export default function AIGeneratorButtonMobile({
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

  // Actualizar tempConcept cuando cambie el prop concept
  useEffect(() => {
    setTempConcept(concept);
  }, [concept]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      // Forzar el scroll al top del modal en móviles
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
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

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
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
        <span className="hidden sm:inline">IA</span>
        <span className="sm:hidden">✨</span>
      </Button>

      {/* Modal personalizado optimizado para móviles */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={handleCancel}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div
            className="relative w-full max-w-lg mx-auto bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BsStars className="text-purple-500 text-xl" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Generador de Contenido con IA
                </h3>
              </div>
              <button
                onClick={handleCancel}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                type="button"
              >
                <BsX className="text-2xl text-gray-500" />
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
                  autoFocus
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
                    <span>Generando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <BsStars />
                    <span>Generar con IA</span>
                  </div>
                )}
              </Button>

              {/* Mostrar errores */}
              {error && (
                <Alert color="failure" className="text-sm">
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
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-t border-gray-200">
              <Button 
                color="gray" 
                onClick={handleCancel}
                className="w-full sm:w-auto order-2 sm:order-1"
                size="lg"
              >
                Cancelar
              </Button>
              {generatedResult && (
                <Button 
                  onClick={handleApply} 
                  color="purple"
                  className="w-full sm:w-auto order-1 sm:order-2"
                  size="lg"
                >
                  Aplicar Contenido
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
