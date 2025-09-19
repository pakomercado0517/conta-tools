import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

// Tipo de retorno de la función createClient
interface CreateClientResult {
  supabase: SupabaseClient;
  response: NextResponse;
}

/**
 * Crea un cliente de Supabase para uso en middleware de Next.js
 * @param request - Request de Next.js
 * @returns Cliente de Supabase y respuesta
 * @throws Error si las variables de entorno no están definidas
 */
export function createClient(request: NextRequest): CreateClientResult {
  // Validar variables de entorno
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables in middleware. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = options || {};
            request.cookies.set({ name, value, ...cookieOptions });
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = options || {};
            supabaseResponse.cookies.set(name, value, cookieOptions);
          });
        },
      },
    }
  );

  return { supabase, response: supabaseResponse };
}
