import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import { DEFAULT_SYSTEM_INSTRUCTION } from "@/lib/ai-prompts";

interface AIGenerateRequest {
  prompt: string;
  systemInstruction?: string;
}

interface GroqChatCompletionResponse {
  choices?: {
    message?: {
      content?: string | null;
    };
    finish_reason?: string;
  }[];
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

interface AIGenerateResponse {
  success: boolean;
  data: string;
}

interface ErrorResponse {
  error: string;
}

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_MAX_COMPLETION_TOKENS = 384;

/**
 * POST /api/ai/generate
 * Genera contenido usando Groq (API compatible con OpenAI Chat Completions)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<AIGenerateResponse | ErrorResponse>> {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || !("prompt" in body)) {
      return NextResponse.json(
        { error: "El cuerpo de la petición debe incluir un prompt" },
        { status: 400 }
      );
    }

    const { prompt, systemInstruction } = body as AIGenerateRequest;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json(
        { error: "El prompt es requerido y debe ser un string válido" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key de Groq no configurada (GROQ_API_KEY)" },
        { status: 500 }
      );
    }

    const systemMessage =
      typeof systemInstruction === "string" && systemInstruction.trim()
        ? systemInstruction.trim()
        : DEFAULT_SYSTEM_INSTRUCTION;

    const model = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
    const parsedMaxTokens = Number(process.env.GROQ_MAX_COMPLETION_TOKENS);
    const maxCompletionTokens = Number.isFinite(parsedMaxTokens)
      ? parsedMaxTokens
      : DEFAULT_MAX_COMPLETION_TOKENS;

    const response = await axios.post<GroqChatCompletionResponse>(
      GROQ_CHAT_URL,
      {
        model,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt.trim() },
        ],
        max_completion_tokens: maxCompletionTokens,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generatedText = response.data.choices?.[0]?.message?.content?.trim();

    if (!generatedText) {
      const finishReason = response.data.choices?.[0]?.finish_reason;
      if (finishReason === "content_filter") {
        return NextResponse.json(
          {
            error:
              "No se pudo generar contenido por filtros de seguridad del modelo",
          },
          { status: 422 }
        );
      }

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
    console.error("Error al generar contenido con IA (Groq):", error);

    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const groqError = (error.response?.data as GroqChatCompletionResponse)
        ?.error;
      const message = groqError?.message ?? error.message;

      if (status === 400) {
        return NextResponse.json(
          { error: message || "Petición inválida a Groq" },
          { status: 400 }
        );
      }

      if (status === 401 || status === 403) {
        return NextResponse.json(
          { error: "API key de Groq inválida o sin permisos" },
          { status: 401 }
        );
      }

      if (status === 429 || status === 503) {
        return NextResponse.json(
          {
            error:
              message ||
              "Límite de cuota o rate limit de Groq alcanzado. Inténtalo más tarde.",
          },
          { status: 429 }
        );
      }

      if (status === 404) {
        return NextResponse.json(
          {
            error: `Modelo de Groq no encontrado. Revisa GROQ_MODEL (actual: ${process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL})`,
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
