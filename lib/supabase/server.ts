import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

// Tipos para las variables de entorno de Supabase
interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Crea un cliente de Supabase para uso en Server Components y API Routes
 * @returns Cliente de Supabase configurado para el servidor
 * @throws Error si las variables de entorno no están definidas
 */
export function createClient(): SupabaseClient {
  // Validar que las variables de entorno estén definidas
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables in server client. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  const config: SupabaseConfig = {
    url,
    anonKey,
  };

  const cookieStore = cookies();

  return createServerClient(
    config.url,
    config.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // El método `setAll` fue llamado desde un Server Component.
            // Esto puede ignorarse si tienes middleware actualizando las sesiones de usuario.
            console.warn('Could not set cookies in server component:', error);
          }
        },
      },
    }
  );
}
