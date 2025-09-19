import { NextRequest, NextResponse } from 'next/server';

// Interfaz para la respuesta de debug
interface DebugResponse {
  message: string;
  timestamp: string;
  url: string;
  method: string;
  userAgent?: string;
  ip?: string;
  headers?: Record<string, string>;
}

/**
 * Ruta de debug GET para verificar que las API routes funcionan
 * Devuelve información básica del servidor y la petición
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const response: DebugResponse = {
    message: 'API Routes are working!',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: 'GET',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for') || undefined,
    headers: Object.fromEntries(request.headers.entries())
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

/**
 * Ruta de debug POST para verificar que las API routes funcionan
 * Devuelve información de la petición incluyendo el cuerpo si existe
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown = null;
  
  try {
    // Intentar parsear el cuerpo si existe
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else if (contentType?.includes('text/')) {
      body = await request.text();
    }
  } catch (error) {
    console.warn('Could not parse request body:', error);
    body = 'Unable to parse body';
  }

  const response: DebugResponse & { body?: unknown } = {
    message: 'API Routes are working!',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: 'POST',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for') || undefined,
    headers: Object.fromEntries(request.headers.entries()),
    body
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}