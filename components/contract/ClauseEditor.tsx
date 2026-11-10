"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Textarea, Label, Alert } from "flowbite-react";
import { FaPen, FaMagic, FaTrash, FaCheck, FaSpinner, FaEye, FaCopy, FaExclamationTriangle } from "react-icons/fa";
import { ClausulaUsuario } from "@/types/contract-v2";

interface ClauseEditorProps {
  clause: ClausulaUsuario;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onRemove: () => void;
  onPolish: (clause: ClausulaUsuario) => Promise<void>;
  updateClause: (id: string, updates: Partial<ClausulaUsuario>) => void;
}

export default function ClauseEditor({
  clause,
  index,
  isEditing,
  onEdit,
  onSave,
  onRemove,
  onPolish,
  updateClause,
}: ClauseEditorProps) {
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishError, setPolishError] = useState<string | null>(null);
  const [showPolished, setShowPolished] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus al entrar en edición
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateClause(clause.id, { textoOriginal: e.target.value });
  };

  const handlePolish = async () => {
    if (!clause.textoOriginal.trim()) return;
    
    setIsPolishing(true);
    setPolishError(null);
    
    try {
      await onPolish(clause);
      setShowPolished(true);
    } catch (error) {
      setPolishError((error as Error).message);
    } finally {
      setIsPolishing(false);
    }
  };

  const toggleView = () => {
    if (clause.textoPulido) {
      setShowPolished(!showPolished);
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${isEditing ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-gray-200 dark:border-gray-700"}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-300">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Cláusula adicional #{index + 1}
          </span>
          {clause.pulida && (
            <span className="px-2 py-0.5 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
              Pulida con IA
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              {clause.textoPulido && (
                <Button
                  color="link"
                  size="sm"
                  onClick={toggleView}
                  className={showPolished ? "bg-green-50 dark:bg-green-900/20" : ""}
                >
                  <FaEye className="mr-1" />
                  {showPolished ? "Ver original" : "Ver pulida"}
                </Button>
              )}
              <Button color="link" size="sm" onClick={onEdit} className="text-blue-600 dark:text-blue-400">
                <FaPen className="mr-1" /> Editar
              </Button>
              <Button color="link" size="sm" onClick={onRemove} className="text-red-500">
                <FaTrash />
              </Button>
            </>
          ) : (
            <>
              <Button 
                color="secondary" 
                size="sm" 
                onClick={onSave}
                className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-600"
              >
                <FaCheck className="mr-1" /> Guardar
              </Button>
              <Button color="link" size="sm" onClick={onSave} className="text-gray-500">
                Cancelar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {isEditing ? (
          // Modo edición
          <div className="space-y-3">
            <Label htmlFor={`clause-${clause.id}`} value="Texto de la cláusula" className="block" />
            <Textarea
              ref={textareaRef}
              id={`clause-${clause.id}`}
              value={clause.textoOriginal}
              onChange={handleChange}
              placeholder="Escribe tu cláusula aquí... Ej: Las partes acuerdan que cualquier controversia se resolverá mediante mediación previa..."
              rows={4}
              className="font-mono text-sm"
            />
            
            <div className="flex flex-wrap gap-2">
              <Button
                outline
                onClick={handlePolish}
                disabled={isPolishing || !clause.textoOriginal.trim()}
                className="flex items-center gap-1"
              >
                {isPolishing ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Puliendo...
                  </>
                ) : (
                  <>
                    <FaMagic className="mr-1" />
                    Dar tono jurídico con IA
                  </>
                )}
              </Button>
              
              {clause.textoPulido && !isPolishing && (
                <Button
                  color="link"
                  size="sm"
                  onClick={() => {
                    updateClause(clause.id, { textoOriginal: clause.textoPulido || "" });
                    setShowPolished(false);
                  }}
                  className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-600"
                >
                  <FaCheck className="mr-1" /> Usar versión pulida
                </Button>
              )}
            </div>

            {polishError && (
              <Alert color="failure" className="mt-2 text-sm">
                <FaExclamationTriangle className="mr-1" />
                Error al pulir: {polishError}
              </Alert>
            )}
          </div>
        ) : (
          // Modo vista
          <div className="space-y-3">
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {showPolished && clause.textoPulido ? clause.textoPulido : clause.textoOriginal}
            </div>
            
            {clause.textoPulido && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {showPolished ? "Mostrando versión pulida por IA" : "Versión original (click para ver pulida)"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button color="link" size="sm" onClick={toggleView}>
                      {showPolished ? <FaEye /> : <FaMagic />} 
                      {showPolished ? "Ver original" : "Ver pulida"}
                    </Button>
                    <Button color="link" size="sm" onClick={() => navigator.clipboard.writeText(showPolished ? (clause.textoPulido ?? clause.textoOriginal) : clause.textoOriginal)}>
                      <FaCopy className="mr-1" /> Copiar
                    </Button>
                  </div>
                </div>
                
                {showPolished && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                    <p className="text-xs text-green-700 dark:text-green-300">
                      <strong>Versión pulida:</strong> La IA ha mejorado la redacción manteniendo el sentido original.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}