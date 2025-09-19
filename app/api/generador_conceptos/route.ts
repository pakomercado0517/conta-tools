import { NextRequest, NextResponse } from "next/server";
import Fuse from "fuse.js";
import catalogo from "@/utils/catalogs/c_ClaveProdServ.json";

// Interfaz para el item del catálogo SAT
interface CatalogoItem {
  id: string;
  descripcion: string;
  incluirIVATrasladado: string;
  incluirIEPSTrasladado: string;
  complementoQueDebeIncluir: string;
  fechaInicioVigencia: string;
  fechaFinVigencia: string;
  estimuloFranjaFronteriza: string;
  palabrasSimilares: string;
}

// Interfaz para el resultado simplificado de búsqueda
interface BusquedaResult {
  clave: string;
  descripcion: string;
}

// Interfaz para el request body
interface GeneradorConceptosRequest {
  descripcion: string;
}

// Interfaz para las respuestas
interface GeneradorConceptosResponse {
  claves: string[];
  total?: number;
  descripcionBusqueda?: string;
}

interface ErrorResponse {
  error: string;
  message: string;
}

// Configuración específica para Fuse.js con el formato del catálogo SAT
const fuse = new Fuse(catalogo as CatalogoItem[], {
  keys: ["descripcion", "palabrasSimilares"], // Incluir palabras similares para mejor búsqueda
  threshold: 0.3, // Tolerancia a errores tipográficos
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 3,
  findAllMatches: false,
  useExtendedSearch: true
});

/**
 * Función para buscar claves del catálogo SAT
 * Combina búsqueda difusa con Fuse.js y búsqueda exacta
 * 
 * @param descripcion - Texto de descripción a buscar
 * @returns Array de resultados únicos
 */
function buscarClaves(descripcion: string): BusquedaResult[] {
  const texto = descripcion.toLowerCase().trim();

  // Búsqueda difusa con Fuse.js
  const fuseResults = fuse.search(texto);

  // Búsqueda por coincidencia directa (respaldo)
  const exactMatches = (catalogo as CatalogoItem[]).filter((item) =>
    item.descripcion?.toLowerCase().includes(texto) ||
    item.palabrasSimilares?.toLowerCase().includes(texto)
  );

  // Combinar ambos resultados sin duplicados usando Map
  const clavesUnicas = new Map<string, BusquedaResult>();

  // Agregar resultados de Fuse.js
  fuseResults.forEach((res) => {
    if (res.item && res.item.id && res.item.descripcion) {
      clavesUnicas.set(res.item.id, {
        clave: res.item.id,
        descripcion: res.item.descripcion,
      });
    }
  });

  // Agregar coincidencias exactas
  exactMatches.forEach((item) => {
    if (item.id && item.descripcion) {
      clavesUnicas.set(item.id, {
        clave: item.id,
        descripcion: item.descripcion,
      });
    }
  });

  return Array.from(clavesUnicas.values());
}

/**
 * Validar el request body
 */
function validarRequest(body: unknown): body is GeneradorConceptosRequest {
  return (
    typeof body === 'object' &&
    body !== null &&
    'descripcion' in body &&
    typeof (body as Record<string, unknown>).descripcion === 'string'
  );
}

/**
 * POST /api/generador_conceptos
 * Busca códigos de productos/servicios del SAT basado en una descripción
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parsear el cuerpo de la petición
    const body: unknown = await request.json();

    // Validar estructura del request
    if (!validarRequest(body)) {
      const errorResponse: ErrorResponse = {
        error: "Invalid request body",
        message: "El cuerpo de la petición debe incluir 'descripcion' como string"
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { descripcion } = body;

    // Validar longitud mínima de descripción
    if (!descripcion || descripcion.trim().length < 2) {
      const response: GeneradorConceptosResponse = {
        claves: ["00000000 - Descripción muy corta"],
        total: 0,
        descripcionBusqueda: descripcion
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validar longitud máxima de descripción (prevenir ataques)
    if (descripcion.length > 500) {
      const errorResponse: ErrorResponse = {
        error: "Description too long",
        message: "La descripción no puede exceder 500 caracteres"
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Realizar búsqueda
    const resultados = buscarClaves(descripcion);

    // Si no hay resultados
    if (resultados.length === 0) {
      const response: GeneradorConceptosResponse = {
        claves: ["00000000 - No se encontraron coincidencias"],
        total: 0,
        descripcionBusqueda: descripcion
      };
      return NextResponse.json(response, { status: 200 });
    }

    // Limitar resultados para evitar respuestas muy grandes
    const resultadosLimitados = resultados.slice(0, 50);

    // Formatear respuesta exitosa
    const response: GeneradorConceptosResponse = {
      claves: resultadosLimitados.map((c) => `${c.clave} - ${c.descripcion}`),
      total: resultadosLimitados.length,
      descripcionBusqueda: descripcion
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache por 1 hora
      }
    });

  } catch (error) {
    console.error('Error en generador_conceptos API:', error);

    // Determinar el tipo de error y responder apropiadamente
    if (error instanceof SyntaxError) {
      const errorResponse: ErrorResponse = {
        error: "Invalid JSON",
        message: "El cuerpo de la petición debe ser JSON válido"
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Error genérico del servidor
    const errorResponse: ErrorResponse = {
      error: "Internal server error",
      message: "Error interno del servidor al procesar la búsqueda"
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * GET /api/generador_conceptos
 * Devuelve información sobre el endpoint
 */
export async function GET(): Promise<NextResponse> {
  const info = {
    endpoint: "/api/generador_conceptos",
    method: "POST",
    description: "Busca códigos de productos/servicios del SAT basado en una descripción",
    body: {
      descripcion: "string (requerido, min: 2 caracteres, max: 500 caracteres)"
    },
    response: {
      claves: "string[] - Array de claves con formato 'CODIGO - DESCRIPCIÓN'",
      total: "number - Cantidad de resultados encontrados",
      descripcionBusqueda: "string - Descripción que se buscó"
    },
    catalogoVersion: "SAT 2019",
    totalItems: catalogo.length
  };

  return NextResponse.json(info, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400' // Cache por 24 horas
    }
  });
}