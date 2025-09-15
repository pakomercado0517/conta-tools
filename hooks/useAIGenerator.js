import { useState, useCallback } from "react";
import axios from "axios";

export default function useAIGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState("");

  // Función principal para generar contenido
  const generateContent = useCallback(async (basePrompt, userInput = "") => {
    setIsLoading(true);
    setError(null);

    try {
      // Construir el prompt completo
      const fullPrompt = userInput.trim()
        ? `${basePrompt} ${userInput}`
        : basePrompt;

      const response = await axios.post("/api/ai/generate", {
        prompt: fullPrompt,
      });

      if (response.data.success) {
        const generatedText = response.data.data;
        setLastGenerated(generatedText);
        return {
          success: true,
          data: generatedText,
        };
      } else {
        throw new Error(response.data.error || "Error desconocido");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Error al generar contenido";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función específica para conceptos de cotización
  const generateQuotationConcept = useCallback(
    async (concept) => {
      const prompt = `Crea un concepto profesional para cotización de: ${concept}. 
    Incluye características técnicas relevantes. 
    Máximo 100 palabras, lenguaje formal y profesional y que sea lo mas breve posible.`;

      return await generateContent(prompt);
    },
    [generateContent],
  );

  // Función específica para contratos
  const generateContractConcept = useCallback(
    async (concept) => {
      const prompt = `Crea una descripción legal y profesional para contrato de: ${concept}. 
    Usa términos jurídicos apropiados. 
    Máximo 120 palabras, lenguaje formal y legal.`;

      return await generateContent(prompt);
    },
    [generateContent],
  );

  // Función específica para objeto del contrato
  const generateContractObject = useCallback(
    async (concept, tipoProducto = "venta") => {
      const tipoTexto = tipoProducto === "venta" ? "venta de productos" : "prestación de servicios";
      const prompt = `Redacta un objeto de contrato legal para ${tipoTexto} de: ${concept}. 
    Debe ser una descripción clara y precisa que se usará en la cláusula PRIMERA del contrato. 
    Incluye especificaciones técnicas y características relevantes. 
    Máximo 150 palabras, lenguaje formal y jurídico apropiado para contratos.`;

      return await generateContent(prompt);
    },
    [generateContent],
  );

  // Función para limpiar estados
  const clearState = useCallback(() => {
    setError(null);
    setLastGenerated("");
  }, []);

  // Función para regenerar el último prompt
  const regenerateLastContent = useCallback(async () => {
    if (!lastGenerated) {
      setError("No hay contenido previo para regenerar");
      return { success: false, error: "No hay contenido previo" };
    }

    // Aquí podrías implementar lógica para recordar el último prompt
    // Por simplicidad, retornamos el último resultado
    return { success: true, data: lastGenerated };
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
