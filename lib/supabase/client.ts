import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Tipos para las variables de entorno
interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Crea un cliente de Supabase para uso en el navegador
 * @returns Cliente de Supabase configurado
 * @throws Error si las variables de entorno no están definidas
 */
export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validar que las variables de entorno estén definidas
  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  const config: SupabaseConfig = {
    url,
    anonKey,
  };

  return createBrowserClient(config.url, config.anonKey);
}

// Cliente singleton para uso en toda la aplicación
let supabaseClient: SupabaseClient | null = null;

/**
 * Obtiene una instancia singleton del cliente de Supabase
 * @returns Instancia única del cliente de Supabase
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}

// Exportar el cliente por defecto
export default createClient;