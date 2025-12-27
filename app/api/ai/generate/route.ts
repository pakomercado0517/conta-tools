import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

// Interfaces para tipos
interface AIGenerateRequest {
  prompt: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface AIGenerateResponse {
  success: boolean;
  data: string;
}

interface ErrorResponse {
  error: string;
}

/**
 * POST /api/ai/generate
 * Genera contenido usando OpenAI GPT-3.5
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<AIGenerateResponse | ErrorResponse>> {
  try {
    const body: unknown = await request.json();

    // Validar estructura del request
    if (!body || typeof body !== "object" || !("prompt" in body)) {
      return NextResponse.json(
        { error: "El cuerpo de la petición debe incluir un prompt" },
        { status: 400 }
      );
    }

    const { prompt } = body as AIGenerateRequest;

    // Validar que el prompt existe
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json(
        { error: "El prompt es requerido y debe ser un string válido" },
        { status: 400 }
      );
    }

    // Validar que la API key existe
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "API key de OpenAI no configurada" },
        { status: 500 }
      );
    }

    // Hacer la petición a OpenAI
    const response = await axios.post<OpenAIResponse>(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente especializado en crear conceptos profesionales y descripciones para cotizaciones y contratos. Responde de manera concisa, profesional y en español.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generatedText = response.data.choices[0]?.message?.content?.trim();

    if (!generatedText) {
      return NextResponse.json(
        { error: "No se pudo generar contenido" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: generatedText,
    });
  } catch (error) {
    console.error("Error al generar contenido con IA:", error);

    // Manejar errores específicos de OpenAI con tipo AxiosError
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        return NextResponse.json(
          { error: "API key de OpenAI inválida" },
          { status: 401 }
        );
      }

      if (error.response?.status === 429) {
        return NextResponse.json(
          { error: "Límite de rate excedido. Inténtalo más tarde." },
          { status: 429 }
        );
      }

      if (error.response?.status === 400) {
        return NextResponse.json(
          { error: "Petición inválida a OpenAI" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
