import { NextRequest, NextResponse } from "next/server";
import { polishUserClause, checkOpenRouterConfig } from "@/lib/ai/openrouter";
import { SYSTEM_PROMPT_POLISH_CLAUSE, buildPolishClausePrompt } from "@/lib/ai/prompts/contract-prompts";
import { PolishClauseRequestSchema, PolishClauseResponseSchema } from "@/types/contract-v2";
import { parseJsonLenient } from "@/lib/ai/json-repair";

// ============================================================================
// POST /api/ai/polish-clause
// Da tono jurídico a una cláusula escrita por el usuario
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verificar configuración
    const configCheck = checkOpenRouterConfig();
    if (!configCheck.valid) {
      return NextResponse.json(
        { error: "Configuración de IA incompleta", missing: configCheck.missing },
        { status: 500 }
      );
    }

    // Parsear y validar
    const body = await request.json();
    const validation = PolishClauseRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Request inválido", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { clausulaTexto, contextoContrato } = validation.data;

    // Construir prompt
    const userPrompt = buildPolishClausePrompt(clausulaTexto, contextoContrato);

    // Llamar a IA
    const result = await polishUserClause(SYSTEM_PROMPT_POLISH_CLAUSE, userPrompt);

    // Parsear respuesta (tolerante a JSON imperfecto de LLMs)
    let parsed;
    try {
      parsed = parseJsonLenient(result.content);
    } catch (e) {
      console.error("Error parseando respuesta pulido:", e, result.content);
      return NextResponse.json(
        { error: "Respuesta de IA inválida", details: (e as Error).message },
        { status: 500 }
      );
    }

    // Validar estructura
    const responseValidation = PolishClauseResponseSchema.safeParse(parsed);
    if (!responseValidation.success) {
      return NextResponse.json(
        { error: "Estructura de respuesta inválida", details: responseValidation.error.flatten() },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ...responseValidation.data,
      usage: result.usage,
    });

  } catch (error) {
    console.error("Error en /api/ai/polish-clause:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Info del endpoint
// ============================================================================

export async function GET(): Promise<NextResponse> {
  const configCheck = checkOpenRouterConfig();
  
  return NextResponse.json({
    endpoint: "/api/ai/polish-clause",
    method: "POST",
    description: "Da tono jurídico profesional a una cláusula escrita por el usuario",
    config: {
      configured: configCheck.valid,
      missing: configCheck.missing,
    },
    requestBody: {
      clausulaTexto: "string (10-2000 chars) - Texto original del usuario",
      contextoContrato: {
        tipoContrato: "venta|arrendamiento|servicios|obra|mandato|personalizado",
        parteA: "string - Nombre parte A",
        parteB: "string - Nombre parte B",
        objetoDescripcion: "string - Descripción del objeto",
      },
    },
    response: {
      textoPulido: "string - Cláusula con tono jurídico",
      cambiosPrincipales: "string[] - Lista de cambios hechos (opcional)",
    },
    model: "nvidia/nemotron-3-ultra-550b-a55b:free",
    temperature: 0.2,
  });
}