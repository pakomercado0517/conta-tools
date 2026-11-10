// ============================================================================
// CONFIGURACIÓN IA (Gemini / OpenRouter)
// ============================================================================

type AIProvider = "gemini" | "openrouter";

interface OpenRouterConfig {
  provider: AIProvider;
  baseURL: string;
  apiKey: string;
  defaultModel: string;
  siteURL: string;
  siteName: string;
  generationParams: {
    temperature: number;
    max_tokens: number;
    top_p: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
}

function getActiveProvider(): AIProvider {
  const forced = process.env.AI_PROVIDER?.toLowerCase();
  if (forced === "gemini" || forced === "openrouter") {
    return forced;
  }
  // Preferir Gemini si hay key (pruebas / generación de contratos)
  if (process.env.GEMINI_API_KEY) {
    return "gemini";
  }
  return "openrouter";
}

function getOpenRouterConfig(): OpenRouterConfig {
  const provider = getActiveProvider();

  if (provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY no está configurada en variables de entorno");
    }

    return {
      provider: "gemini",
      // Endpoint OpenAI-compatible de Google Generative Language API
      baseURL:
        process.env.GEMINI_BASE_URL ||
        "https://generativelanguage.googleapis.com/v1beta/openai",
      apiKey,
      defaultModel: process.env.GEMINI_MODEL || "gemini-3-flash-preview",
      siteURL: process.env.OPENROUTER_SITE_URL || "https://conta-tools.vercel.app",
      siteName: process.env.OPENROUTER_SITE_NAME || "ContaTools",
      generationParams: {
        temperature: Number(process.env.GEMINI_TEMPERATURE) || 0.3,
        max_tokens: Number(process.env.GEMINI_MAX_TOKENS) || 8192,
        top_p: Number(process.env.GEMINI_TOP_P) || 0.9,
      },
    };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY no está configurada en variables de entorno");
  }

  return {
    provider: "openrouter",
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    apiKey,
    defaultModel: process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free",
    siteURL: process.env.OPENROUTER_SITE_URL || "https://conta-tools.vercel.app",
    siteName: process.env.OPENROUTER_SITE_NAME || "ContaTools",
    generationParams: {
      temperature: Number(process.env.OPENROUTER_TEMPERATURE) || 0.3,
      max_tokens: Number(process.env.OPENROUTER_MAX_TOKENS) || 8192,
      top_p: Number(process.env.OPENROUTER_TOP_P) || 0.9,
      frequency_penalty: Number(process.env.OPENROUTER_FREQ_PENALTY) || 0.1,
      presence_penalty: Number(process.env.OPENROUTER_PRES_PENALTY) || 0.1,
    },
  };
}

function buildCompletionBody(
  config: OpenRouterConfig,
  messages: ChatMessage[],
  mergedParams: OpenRouterConfig["generationParams"] & { stream?: boolean }
) {
  const body: Record<string, unknown> = {
    model: config.defaultModel,
    messages,
    temperature: mergedParams.temperature,
    max_tokens: mergedParams.max_tokens,
    top_p: mergedParams.top_p,
    stream: mergedParams.stream ?? false,
  };

  // Gemini OpenAI-compat no siempre acepta estos penalties
  if (config.provider === "openrouter") {
    body.frequency_penalty = mergedParams.frequency_penalty;
    body.presence_penalty = mergedParams.presence_penalty;
  }

  return body;
}

// ============================================================================
// TIPOS PARA GENERACIÓN
// ============================================================================

export interface GenerationParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerationResult {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  finish_reason: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  usage?: GenerationResult["usage"];
}

// ============================================================================
// FUNCIÓN PRINCIPAL: GENERAR COMPLETACIÓN (USA FETCH NATIVO)
// ============================================================================

export async function generateCompletion(
  messages: ChatMessage[],
  params: GenerationParams = {}
): Promise<GenerationResult> {
  const config = getOpenRouterConfig();

  const mergedParams = {
    ...config.generationParams,
    ...params,
  };

  console.log(`[AI:${config.provider}] Iniciando generateCompletion, model:`, config.defaultModel);
  console.log(`[AI:${config.provider}] Params:`, { temperature: mergedParams.temperature, max_tokens: mergedParams.max_tokens });
  console.log(`[AI:${config.provider}] Messages count:`, messages.length);

  try {
    console.log(`[AI:${config.provider}] Llamando a fetch nativo...`);
    const startTime = Date.now();
    
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
        "HTTP-Referer": config.siteURL,
        "X-Title": config.siteName,
      },
      body: JSON.stringify(buildCompletionBody(config, messages, { ...mergedParams, stream: false })),
      // Timeout de 2 minutos
      signal: AbortSignal.timeout(120_000),
    });

    console.log("[OpenRouter] Respuesta HTTP:", response.status, "en", Date.now() - startTime, "ms");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    console.log("[OpenRouter] Parsing response JSON...");
    const completion = await response.json();
    console.log("[OpenRouter] JSON parsed successfully, id:", completion.id);

    // Debug: log the full completion structure
    console.log("[OpenRouter] Completion keys:", Object.keys(completion));
    console.log("[OpenRouter] Completion.choices:", completion.choices);

    const choice = completion.choices[0];
    if (!choice?.message?.content) {
      throw new Error("Respuesta vacía del modelo");
    }

    return {
      content: choice.message.content,
      usage: completion.usage ? {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens,
      } : undefined,
      model: completion.model,
      finish_reason: choice.finish_reason || "unknown",
    };
  } catch (error) {
    console.error("Error en generateCompletion:", error);
    throw mapOpenRouterError(error);
  }
}

// ============================================================================
// FUNCIÓN STREAMING: GENERAR COMPLETACIÓN CON STREAM (USA FETCH NATIVO + SSE)
// ============================================================================

export async function* generateCompletionStream(
  messages: ChatMessage[],
  params: GenerationParams = {}
): AsyncGenerator<StreamChunk, void, unknown> {
  const config = getOpenRouterConfig();

  const mergedParams = {
    ...config.generationParams,
    ...params,
    stream: true,
  };

  console.log(`[AI:${config.provider}] Iniciando generateCompletionStream, model:`, config.defaultModel);
  console.log(`[AI:${config.provider}] Params:`, { temperature: mergedParams.temperature, max_tokens: mergedParams.max_tokens });

  let finalUsage: GenerationResult["usage"] | undefined;

  try {
    console.log(`[AI:${config.provider}] Llamando a fetch nativo (stream)...`);
    
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
        "HTTP-Referer": config.siteURL,
        "X-Title": config.siteName,
        "Accept": "text/event-stream",
      },
      body: JSON.stringify(buildCompletionBody(config, messages, { ...mergedParams, stream: true })),
      signal: AbortSignal.timeout(120_000),
    });

    console.log(`[AI:${config.provider}] Stream response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${config.provider} API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    console.log(`[AI:${config.provider}] Stream iniciado, leyendo chunks...`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            console.log(`[AI:${config.provider}] Stream completado (DONE)`);
            yield {
              content: "",
              done: true,
              usage: finalUsage,
            };
            return;
          }
          try {
            const chunk = JSON.parse(data);
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              yield {
                content: delta,
                done: false,
              };
            }
            if (chunk.usage) {
              finalUsage = {
                prompt_tokens: chunk.usage.prompt_tokens,
                completion_tokens: chunk.usage.completion_tokens,
                total_tokens: chunk.usage.total_tokens,
              };
            }
          } catch {
            // Ignorar líneas no parseables
          }
        }
      }
    }

    console.log(`[AI:${config.provider}] Stream completado, usage:`, finalUsage);

    yield {
      content: "",
      done: true,
      usage: finalUsage,
    };
  } catch (error) {
    console.error("Error en generateCompletionStream:", error);
    throw mapOpenRouterError(error);
  }
}

// ============================================================================
// FUNCIÓN ESPECIALIZADA: GENERAR CONTRATO COMPLETO
// ============================================================================

export interface GenerateContractOptions {
  systemPrompt: string;
  userPrompt: string;
  stream?: boolean;
  onChunk?: (chunk: StreamChunk) => void;
}

export async function generateFullContract(
  options: GenerateContractOptions
): Promise<GenerationResult> {
  const { systemPrompt, userPrompt, stream = false, onChunk } = options;

  const provider = getActiveProvider();
  console.log(`[AI:${provider}] generateFullContract llamado, stream:`, stream);

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  if (stream && onChunk) {
    let fullContent = "";
    let finalUsage: GenerationResult["usage"];
    let finalModel = "";
    let finalFinishReason = "";

    console.log(`[AI:${provider}] Iniciando streaming loop...`);
    for await (const chunk of generateCompletionStream(messages)) {
      onChunk(chunk);
      if (chunk.content) {
        fullContent += chunk.content;
      }
      if (chunk.done) {
        finalUsage = chunk.usage;
      }
    }
    console.log(`[AI:${provider}] Streaming loop completado, content length:`, fullContent.length);

    return {
      content: fullContent,
      usage: finalUsage,
      model: finalModel || getOpenRouterConfig().defaultModel,
      finish_reason: finalFinishReason || "stop",
    };
  }

  console.log(`[AI:${provider}] Llamando a generateCompletion (no-stream)...`);
  return generateCompletion(messages);
}

// ============================================================================
// FUNCIÓN: PULIR CLÁUSULA USUARIO
// ============================================================================

export async function polishUserClause(
  systemPrompt: string,
  userPrompt: string
): Promise<GenerationResult> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return generateCompletion(messages, {
    temperature: 0.2, // Más determinista para pulir
    max_tokens: 2048,
  });
}

// ============================================================================
// FUNCIÓN: CHAT PARA MODIFICAR CONTRATO (FASE 2)
// ============================================================================

export interface ChatContractOptions {
  systemPrompt: string;
  userPrompt: string;
  stream?: boolean;
  onChunk?: (chunk: StreamChunk) => void;
}

export async function chatContractModification(
  options: ChatContractOptions
): Promise<GenerationResult> {
  const { systemPrompt, userPrompt, stream = false, onChunk } = options;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  // Parámetros específicos para chat: temperatura más baja para consistencia
  const chatParams = {
    temperature: 0.2,
    max_tokens: 4096,
  };

  if (stream && onChunk) {
    let fullContent = "";
    let finalUsage: GenerationResult["usage"];
    let finalModel = "";
    let finalFinishReason = "";

    for await (const chunk of generateCompletionStream(messages, { ...chatParams, stream: true })) {
      onChunk(chunk);
      if (chunk.content) {
        fullContent += chunk.content;
      }
      if (chunk.done) {
        finalUsage = chunk.usage;
      }
    }

    return {
      content: fullContent,
      usage: finalUsage,
      model: finalModel || getOpenRouterConfig().defaultModel,
      finish_reason: finalFinishReason || "stop",
    };
  }

  return generateCompletion(messages, chatParams);
}

// ============================================================================
// MAPEO DE ERRORES
// ============================================================================

interface MappedError extends Error {
  code: string;
  statusCode?: number;
  retryable: boolean;
}

function mapOpenRouterError(error: unknown): MappedError {
  const baseError = error as Error & { status?: number; code?: string };

  // Error de autenticación
  if (baseError.status === 401 || baseError.code === "invalid_api_key") {
    return {
      name: "AuthenticationError",
      message: "API Key de OpenRouter inválida o expirada",
      code: "AUTH_INVALID",
      statusCode: 401,
      retryable: false,
    };
  }

  // Rate limit
  if (baseError.status === 429 || baseError.code === "rate_limit") {
    return {
      name: "RateLimitError",
      message: "Límite de cuota alcanzado. Intenta más tarde.",
      code: "RATE_LIMIT",
      statusCode: 429,
      retryable: true,
    };
  }

  // Modelo no encontrado
  if (baseError.status === 404 || baseError.code === "model_not_found") {
    return {
      name: "ModelNotFoundError",
      message: "Modelo no disponible en OpenRouter",
      code: "MODEL_NOT_FOUND",
      statusCode: 404,
      retryable: false,
    };
  }

  // Timeout
  if (baseError.code === "ETIMEDOUT" || baseError.message?.includes("timeout")) {
    return {
      name: "TimeoutError",
      message: "La generación tardó demasiado. Intenta de nuevo.",
      code: "TIMEOUT",
      statusCode: 504,
      retryable: true,
    };
  }

  // Error de red
  if (baseError.code === "ENOTFOUND" || baseError.code === "ECONNREFUSED") {
    return {
      name: "NetworkError",
      message: "Error de conexión con OpenRouter",
      code: "NETWORK_ERROR",
      statusCode: 503,
      retryable: true,
    };
  }

  // Error genérico
  return {
    name: "OpenRouterError",
    message: baseError.message || "Error desconocido en OpenRouter",
    code: "UNKNOWN_ERROR",
    statusCode: baseError.status || 500,
    retryable: false,
  };
}

// ============================================================================
// HELPER: VERIFICAR CONFIGURACIÓN
// ============================================================================

export function checkOpenRouterConfig(): { valid: boolean; missing: string[]; provider?: AIProvider } {
  const provider = getActiveProvider();
  const missing: string[] = [];

  if (provider === "gemini") {
    if (!process.env.GEMINI_API_KEY) {
      missing.push("GEMINI_API_KEY");
    }
  } else if (!process.env.OPENROUTER_API_KEY) {
    missing.push("OPENROUTER_API_KEY");
  }

  return {
    valid: missing.length === 0,
    missing,
    provider,
  };
}

// ============================================================================
// EXPORT PARA TESTING
// ============================================================================

export function resetOpenRouterClient(): void {
  // Ya no hay cliente singleton (se usa fetch + getOpenRouterConfig por request).
  // Se mantiene el export para compatibilidad con tests.
}

// Export config para debugging
export function getConfigForDebug(): Omit<OpenRouterConfig, "apiKey"> {
  const config = getOpenRouterConfig();
  return {
    provider: config.provider,
    baseURL: config.baseURL,
    defaultModel: config.defaultModel,
    siteURL: config.siteURL,
    siteName: config.siteName,
    generationParams: config.generationParams,
  };
}