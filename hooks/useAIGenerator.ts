import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { AIGeneratorResponse } from "@/schemas/api";

// Tipos para el hook
interface AIGeneratorResult {
  success: boolean;
  data?: string;
  error?: string;
}

interface AIGeneratorError {
  success: false;
  error: string;
}

interface AIGeneratorSuccess {
  success: true;
  data: string;
}

// Tipos para el producto del contrato
type TipoProducto = "venta" | "servicio";

// Interface para el valor de retorno del hook
interface UseAIGeneratorReturn {
  // Estados
  isLoading: boolean;
  error: string | null;
  lastGenerated: string;

  // Funciones generales
  generateContent: (
    basePrompt: string,
    userInput?: string
  ) => Promise<AIGeneratorResult>;
  clearState: () => void;
  regenerateLastContent: () => Promise<AIGeneratorResult>;

  // Funciones específicas
  generateQuotationConcept: (concept: string) => Promise<AIGeneratorResult>;
  generateContractConcept: (concept: string) => Promise<AIGeneratorResult>;
  generateContractObject: (
    concept: string,
    tipoProducto?: TipoProducto
  ) => Promise<AIGeneratorResult>;

  // Estado de disponibilidad
  isAvailable: boolean;
}

/**
 * Hook personalizado para manejar la generación de contenido con IA
 * @returns Objeto con estados y funciones para generar contenido
 */
export default function useAIGenerator(): UseAIGeneratorReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string>("");

  /**
   * Función principal para generar contenido con IA
   * @param basePrompt - Prompt base para la generación
   * @param userInput - Input adicional del usuario (opcional)
   * @returns Resultado de la generación
   */
  const generateContent = useCallback(
    async (
      basePrompt: string,
      userInput: string = ""
    ): Promise<AIGeneratorResult> => {
      setIsLoading(true);
      setError(null);

      try {
        // Construir el prompt completo
        const fullPrompt = userInput.trim()
          ? `${basePrompt} ${userInput}`
          : basePrompt;

        const response = await axios.post<AIGeneratorResponse>(
          "/api/ai/generate",
          {
            prompt: fullPrompt,
          }
        );

        if (response.data.success) {
          const generatedText = response.data.data || "";
          setLastGenerated(generatedText);
          return {
            success: true,
            data: generatedText,
          } as AIGeneratorSuccess;
        } else {
          throw new Error(response.data.error || "Error desconocido");
        }
      } catch (err) {
        let errorMessage: string;

        if (err instanceof AxiosError) {
          errorMessage =
            err.response?.data?.error ||
            err.message ||
            "Error de conexión con la API";
        } else if (err instanceof Error) {
          errorMessage = err.message;
        } else {
          errorMessage = "Error desconocido al generar contenido";
        }

        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        } as AIGeneratorError;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Función específica para conceptos de cotización
   * @param concept - Concepto a generar
   * @returns Resultado de la generación
   */
  const generateQuotationConcept = useCallback(
    async (concept: string): Promise<AIGeneratorResult> => {
      if (!concept.trim()) {
        return {
          success: false,
          error: "El concepto no puede estar vacío",
        };
      }

      const prompt = `Crea un concepto profesional para cotización de: ${concept}. 
      Máximo 100 palabras, lenguaje formal y profesional y que sea lo más breve posible.`;

      return await generateContent(prompt);
    },
    [generateContent]
  );

  /**
   * Función específica para contratos
   * @param concept - Concepto del contrato
   * @returns Resultado de la generación
   */
  const generateContractConcept = useCallback(
    async (concept: string): Promise<AIGeneratorResult> => {
      if (!concept.trim()) {
        return {
          success: false,
          error: "El concepto no puede estar vacío",
        };
      }

      const prompt = `Crea una descripción legal y profesional para contrato de: ${concept}. 
      Usa términos jurídicos apropiados y omite las responsabilidades de las dos partes, solo devuelve el concepto. 
      Máximo 120 palabras, lenguaje formal y legal.`;

      return await generateContent(prompt);
    },
    [generateContent]
  );

  /**
   * Función específica para objeto del contrato
   * @param concept - Concepto del objeto
   * @param tipoProducto - Tipo de producto (venta o servicio)
   * @returns Resultado de la generación
   */
  const generateContractObject = useCallback(
    async (
      concept: string,
      tipoProducto: TipoProducto = "venta"
    ): Promise<AIGeneratorResult> => {
      if (!concept.trim()) {
        return {
          success: false,
          error: "El concepto no puede estar vacío",
        };
      }

      const tipoTexto =
        tipoProducto === "venta"
          ? "venta de productos"
          : "prestación de servicios";

      const prompt = `Redacta un objeto de contrato legal para ${tipoTexto} de: ${concept}. 
      Debe ser una descripción clara y precisa que se usará en la cláusula PRIMERA del contrato. 
      Incluye especificaciones técnicas y características relevantes. 
      Máximo 150 palabras, lenguaje formal y jurídico apropiado para contratos.`;

      return await generateContent(prompt);
    },
    [generateContent]
  );

  /**
   * Función para limpiar estados del hook
   */
  const clearState = useCallback((): void => {
    setError(null);
    setLastGenerated("");
  }, []);

  /**
   * Función para regenerar el último contenido (simulada)
   * @returns Resultado de la regeneración
   */
  const regenerateLastContent =
    useCallback(async (): Promise<AIGeneratorResult> => {
      if (!lastGenerated) {
        const errorMsg = "No hay contenido previo para regenerar";
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      }

      // Por simplicidad, retornamos el último resultado
      // En el futuro se podría implementar lógica para recordar el último prompt
      return {
        success: true,
        data: lastGenerated,
      };
    }, [lastGenerated]);

  return {
    // Estados
    isLoading,
    error,
    lastGenerated,

    // Funciones generales
    generateContent,
    clearState,
    regenerateLastContent,

    // Funciones específicas
    generateQuotationConcept,
    generateContractConcept,
    generateContractObject,

    // Estado de disponibilidad
    isAvailable: !isLoading,
  };
}
