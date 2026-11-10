import { NextRequest, NextResponse } from "next/server";
import { generateFullContract, checkOpenRouterConfig } from "@/lib/ai/openrouter";
import { buildUserPrompt, parseAIResponse, validateGeneratedContract, SYSTEM_PROMPT_MAESTRO } from "@/lib/ai/prompts/contract-prompts";
import { ContractInputSchema, GenerateContractRequestSchema } from "@/types/contract-v2";

// ============================================================================
// POST /api/ai/generate-contract
// Genera contrato completo con streaming SSE
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("[API] POST /api/ai/generate-contract received");
  try {
    // Verificar configuración OpenRouter
    const configCheck = checkOpenRouterConfig();
    console.log("[API] OpenRouter config check:", configCheck);
    if (!configCheck.valid) {
      return NextResponse.json(
        { error: "Configuración de IA incompleta", missing: configCheck.missing },
        { status: 500 }
      );
    }

    // Parsear y validar request
    console.log("[API] Parsing request body...");
    const body = await request.json();
    console.log("[API] Request body keys:", Object.keys(body));
    const validation = GenerateContractRequestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("[API] Request validation failed:", validation.error.flatten());
      return NextResponse.json(
        { error: "Request inválido", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { input, stream: shouldStream = true } = validation.data;
    console.log("[API] Parsed input:", { tipoContrato: input?.tipoContrato, hasParteA: !!input?.parteA, hasParteB: !!input?.parteB });

    // Validar input con Zod
    console.log("[API] Validating input with ContractInputSchema...");
    const inputValidation = ContractInputSchema.safeParse(input);
    if (!inputValidation.success) {
      console.error("[API] Input validation failed:", inputValidation.error.flatten());
      return NextResponse.json(
        { error: "Datos de contrato inválidos", details: inputValidation.error.flatten() },
        { status: 400 }
      );
    }

    const contractInput = inputValidation.data;
    console.log("[API] Input validation passed");

    // Construir prompt
    const userPrompt = buildUserPrompt(contractInput);
    console.log("[API] User prompt built, length:", userPrompt.length);

    // Si no es streaming, usar respuesta simple
    if (!shouldStream) {
      console.log("[API] Entering non-stream generation");
      try {
        console.log("[API] Calling generateFullContract...");
        const result = await generateFullContract({
          systemPrompt: SYSTEM_PROMPT_MAESTRO,
          userPrompt,
          stream: false,
        });

        console.log("[API] generateFullContract returned, content length:", result.content?.length);
        console.log("[API] Usage:", result.usage);
        console.log("[API] Parsing AI response...");
        const parsed = parseAIResponse(result.content);
        console.log("[API] Parse successful, keys:", Object.keys(parsed));
        
        // Validar contrato generado
        console.log("[API] Validating contract...");
        const validationResult = validateGeneratedContract(parsed, contractInput);
        if (!validationResult.valid) {
          console.warn("Validación falló:", validationResult.errors);
        }
        console.log("[API] Validation complete, returning response");

        return NextResponse.json({
          success: true,
          contract: parsed,
          validation: validationResult,
          usage: result.usage,
        });
      } catch (parseError) {
        console.error("Error parseando respuesta IA:", parseError);
        return NextResponse.json(
          { error: "Error procesando respuesta de IA", details: (parseError as Error).message },
          { status: 500 }
        );
      }
    }

    // STREAMING SSE
    const encoder = new TextEncoder();
    let fullContent = "";
    let finalUsage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | undefined;

    const sendSSE = (controller: ReadableStreamDefaultController<Uint8Array>, payload: Record<string, unknown>) => {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
    };

    const sseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        sendSSE(controller, {
          type: "start",
          message: "Iniciando generación...",
        });
        sendSSE(controller, {
          type: "progress",
          phase: "preparing",
          percent: 5,
          message: "Preparando solicitud...",
        });

        try {
          await generateFullContract({
            systemPrompt: SYSTEM_PROMPT_MAESTRO,
            userPrompt,
            stream: true,
            onChunk: (chunk) => {
              if (chunk.content) {
                fullContent += chunk.content;
                sendSSE(controller, { type: "chunk", content: chunk.content });
              }
              if (chunk.done) {
                finalUsage = chunk.usage;
              }
            },
          });

          sendSSE(controller, {
            type: "progress",
            phase: "assembling",
            percent: 85,
            message: "Ensamblando contrato...",
          });

          let parsedContract;
          try {
            parsedContract = parseAIResponse(fullContent);

            sendSSE(controller, {
              type: "progress",
              phase: "validating",
              percent: 92,
              message: "Validando estructura...",
            });

            const validationResult = validateGeneratedContract(parsedContract, contractInput);
            parsedContract.warnings = [...(parsedContract.warnings || []), ...validationResult.warnings];

            sendSSE(controller, {
              type: "complete",
              contract: parsedContract,
              validation: validationResult,
              usage: finalUsage,
            });
          } catch (parseError) {
            sendSSE(controller, {
              type: "error",
              error: "Error parseando respuesta de IA",
              details: (parseError as Error).message,
            });
          }
        } catch (genError) {
          sendSSE(controller, {
            type: "error",
            error: "Error generando contrato",
            details: (genError as Error).message,
            retryable: typeof genError === "object" && genError !== null && "retryable" in genError && (genError as { retryable?: boolean }).retryable === true,
          });
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(sseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });

  } catch (error) {
    console.error("Error en /api/ai/generate-contract:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/ai/generate-contract - Info del endpoint
// ============================================================================

export async function GET(): Promise<NextResponse> {
  const configCheck = checkOpenRouterConfig();
  
  return NextResponse.json({
    endpoint: "/api/ai/generate-contract",
    method: "POST",
    description: "Genera un contrato completo usando IA (Nemotron 3 Ultra via OpenRouter)",
    streaming: true,
    contentType: "text/event-stream",
    config: {
      configured: configCheck.valid,
      missing: configCheck.missing,
    },
    requestBody: {
      input: "ContractInput (ver types/contract-v2.ts)",
      stream: "boolean (default: true)",
      userClauses: "string[] (opcional, cláusulas extra solo texto)",
    },
    responseEvents: [
      { type: "start", message: "string" },
      { type: "progress", phase: "preparing | assembling | validating", percent: "number", message: "string" },
      { type: "chunk", content: "string" },
      { type: "complete", contract: "ContractGenerated", validation: "ValidationResult", usage: "Usage" },
      { type: "error", error: "string", details: "string", retryable: "boolean" },
    ],
    model: process.env.GEMINI_API_KEY
      ? (process.env.GEMINI_MODEL || "gemini-3-flash-preview")
      : (process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free"),
    provider: process.env.GEMINI_API_KEY ? "gemini" : "openrouter",
  });
}