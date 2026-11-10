import { NextRequest, NextResponse } from "next/server";
import { chatContractModification, checkOpenRouterConfig } from "@/lib/ai/openrouter";
import { SYSTEM_PROMPT_CHAT, buildChatUserPrompt, parseChatResponse } from "@/lib/ai/prompts/chat-prompts";
import { applyOperations } from "@/lib/contract/chat-engine";
import { ChatContractRequest } from "@/types/contract-v2";

// ============================================================================
// POST /api/ai/chat-contract
// Chat interactivo para modificar contrato generado (streaming SSE)
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verificar configuración OpenRouter
    const configCheck = checkOpenRouterConfig();
    if (!configCheck.valid) {
      return NextResponse.json(
        { error: "Configuración de IA incompleta", missing: configCheck.missing },
        { status: 500 }
      );
    }

    // Parsear y validar request
    const body = await request.json();
    // Validar request manualmente
    if (!body.contract || !body.message || !Array.isArray(body.history)) {
      return NextResponse.json(
        { error: "Request inválido: se requieren contract, message y history" },
        { status: 400 }
      );
    }

    const { contract, message, history, stream = true } = body as ChatContractRequest;

    // Validar que el contrato tenga estructura básica
    if (!contract.clausulas || !contract.clausulas.length) {
      return NextResponse.json(
        { error: "Contrato inválido: sin cláusulas" },
        { status: 400 }
      );
    }

    // Construir prompt
    const userPrompt = buildChatUserPrompt(contract, message, history);

    // Si no es streaming, usar respuesta simple
    if (!stream) {
      try {
        const result = await chatContractModification({
          systemPrompt: SYSTEM_PROMPT_CHAT,
          userPrompt,
          stream: false,
        });

        const parsed = parseChatResponse(result.content);
        
        if (!parsed.valid) {
          return NextResponse.json(
            { error: "Respuesta de IA inválida", details: parsed.errors },
            { status: 500 }
          );
        }

        // Aplicar operaciones al contrato
        const applyResult = applyOperations(contract, parsed.operations);
        
        return NextResponse.json({
          success: true,
          contract: applyResult.contract,
          operations: parsed.operations,
          explicacion: parsed.explicacion,
          errors: applyResult.errors,
          warnings: applyResult.warnings,
          usage: result.usage,
        });
      } catch (parseError) {
        console.error("Error parseando respuesta IA chat:", parseError);
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

    const sseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        // Enviar evento inicial
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "start", message: "Procesando instrucción..." })}\n\n`));

        try {
          await chatContractModification({
            systemPrompt: SYSTEM_PROMPT_CHAT,
            userPrompt,
            stream: true,
            onChunk: (chunk) => {
              if (chunk.content) {
                fullContent += chunk.content;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "chunk", content: chunk.content })}\n\n`));
              }
              if (chunk.done) {
                finalUsage = chunk.usage;
              }
            },
          });

          // Parsear respuesta completa
          let parsed;
          try {
            parsed = parseChatResponse(fullContent);
          } catch (parseError) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: "error", 
              error: "Error parseando respuesta de IA",
              details: (parseError as Error).message,
            })}\n\n`));
            controller.close();
            return;
          }

          if (!parsed.valid) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: "error", 
              error: "Respuesta de IA inválida",
              details: parsed.errors.join(", "),
            })}\n\n`));
            controller.close();
            return;
          }

          // Aplicar operaciones al contrato
          const applyResult = applyOperations(contract, parsed.operations);

          // Enviar respuesta completa
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: "complete",
            contract: applyResult.contract,
            operations: parsed.operations,
            explicacion: parsed.explicacion,
            errors: applyResult.errors,
            warnings: applyResult.warnings,
            usage: finalUsage,
          })}\n\n`));

        } catch (genError) {
          console.error("Error en chat-contract streaming:", genError);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: "error", 
            error: "Error procesando instrucción",
            details: (genError as Error).message,
            retryable: typeof genError === "object" && genError !== null && "retryable" in genError && (genError as { retryable?: boolean }).retryable === true,
          })}\n\n`));
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
    console.error("Error en /api/ai/chat-contract:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/ai/chat-contract - Info del endpoint
// ============================================================================

export async function GET(): Promise<NextResponse> {
  const configCheck = checkOpenRouterConfig();
  
  return NextResponse.json({
    endpoint: "/api/ai/chat-contract",
    method: "POST",
    description: "Chat interactivo para modificar contrato generado (streaming SSE)",
    streaming: true,
    contentType: "text/event-stream",
    config: {
      configured: configCheck.valid,
      missing: configCheck.missing,
    },
    requestBody: {
      contract: "ContractGenerated (ver types/contract-v2.ts)",
      message: "string - Instrucción en lenguaje natural",
      history: "ChatMessage[] - Historial de conversación",
      stream: "boolean (default: true)",
    },
    responseEvents: [
      { type: "start", message: "string" },
      { type: "chunk", content: "string" },
      { type: "complete", contract: "ContractGenerated", operations: "ContractOperation[]", explicacion: "string", errors: "string[]", warnings: "string[]", usage: "Usage" },
      { type: "error", error: "string", details: "string", retryable: "boolean" },
    ],
    operations: [
      "ELIMINAR_CLAUSULA",
      "MODIFICAR_CLAUSULA", 
      "INSERTAR_CLAUSULA",
      "CAMPO_GLOBAL (jurisdiccion|fechaFin|monto|iva|tipoPago|condicionesPago)",
      "REORDENAR_CLAUSULAS",
      "TOGGLE_CLAUSULA_ESTANDAR"
    ],
    model: "nvidia/nemotron-3-ultra-550b-a55b:free",
  });
}