"use client";
import { useState, useEffect } from 'react';
import { Button, Spinner, Modal, Alert } from 'flowbite-react';
import { BsStars } from 'react-icons/bs';
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

  // Auto-scroll to top when modal opens (especially useful for mobile)
  useEffect(() => {
    if (showModal) {
      // Smooth scroll to top of the page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
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

      <Modal show={showModal} onClose={handleCancel} size="lg">
        <Modal.Header>
          <div className="flex items-center gap-2">
            <BsStars className="text-purple-500" />
            Generador de Contenido con IA
          </div>
        </Modal.Header>
        
        <Modal.Body>
          <div className="space-y-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Botón generar */}
            <Button
              onClick={handleGenerate}
              disabled={!tempConcept.trim() || isLoading}
              color="purple"
              className="w-full"
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
                <div className="p-4 bg-gray-50 rounded-md border">
                  <p className="text-gray-800 leading-relaxed">
                    {generatedResult}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex justify-end gap-2 w-full">
            <Button color="gray" onClick={handleCancel}>
              Cancelar
            </Button>
            {generatedResult && (
              <Button onClick={handleApply} color="purple">
                Aplicar Contenido
              </Button>
            )}
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
