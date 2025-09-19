import { NextRequest, NextResponse } from 'next/server';
import { createClient } from './lib/supabase/middleware';
import type { User } from '@supabase/supabase-js';

// Tipos para las rutas de la aplicación
type RouteArray = readonly string[];

// Configuración de rutas
const routeConfig = {
  // Rutas públicas (no requieren autenticación)
  public: [
    '/',
    '/counterMoney',
    '/getCosts',
    '/sdiCalculator', 
    '/generador_conceptos',
    '/licensing',
    '/dev-tools'
  ] as const,

  // Rutas de autenticación (redirigir si ya está autenticado)
  auth: [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
  ] as const,

  // Rutas protegidas (requieren autenticación)
  protected: [
    '/dashboard',
    '/generador_contratos',
    '/quotation',
    '/paybackInformation',
    '/profile'
  ] as const,
} as const;

// Tipos para el estado del usuario
interface UserStatus {
  authenticated: boolean;
  email?: string;
  pathname: string;
}

/**
 * Verifica si una ruta coincide con alguna de las rutas definidas
 * @param pathname - La ruta actual
 * @param routes - Array de rutas a verificar
 * @returns true si coincide con alguna ruta
 */
function matchesRoute(pathname: string, routes: RouteArray): boolean {
  return routes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Crea un log del estado del usuario para debugging
 * @param user - Usuario de Supabase (puede ser null)
 * @param pathname - Ruta actual
 */
function logUserStatus(user: User | null, pathname: string): void {
  const userStatus: UserStatus = {
    authenticated: !!user,
    email: user?.email,
    pathname
  };
  
  console.log('👤 User status:', userStatus);
}

/**
 * Middleware principal para manejar autenticación con Supabase
 * @param request - Request de Next.js
 * @returns Response de Next.js
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    const { supabase, response } = createClient(request);
    const { pathname } = request.nextUrl;

    console.log('🔍 Supabase middleware check:', pathname);

    // Obtener usuario actual
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.warn('⚠️ Error getting user in middleware:', error.message);
    }
    
    logUserStatus(user, pathname);

    // Si es una ruta pública, permitir acceso
    if (matchesRoute(pathname, routeConfig.public)) {
      console.log('✅ Public route, allowing access');
      return response;
    }

    // Si es una ruta de auth y el usuario está autenticado, redirigir al dashboard
    if (matchesRoute(pathname, routeConfig.auth)) {
      if (user) {
        console.log('↩️ Already authenticated, redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      // Usuario no autenticado en ruta de auth, permitir acceso
      return response;
    }

    // Si es una ruta protegida, verificar autenticación estrictamente
    if (matchesRoute(pathname, routeConfig.protected)) {
      if (!user) {
        console.log('❌ Protected route without auth, redirecting to login');
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      // Verificación adicional: validar que el usuario tenga sesión activa
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.log('❌ Invalid or expired session, redirecting to login');
          const loginUrl = new URL('/auth/login', request.url);
          loginUrl.searchParams.set('redirectTo', pathname);
          loginUrl.searchParams.set('reason', 'session_expired');
          return NextResponse.redirect(loginUrl);
        }
        
        // Verificar que la sesión no haya expirado
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at && session.expires_at < now) {
          console.log('❌ Session expired, redirecting to login');
          const loginUrl = new URL('/auth/login', request.url);
          loginUrl.searchParams.set('redirectTo', pathname);
          loginUrl.searchParams.set('reason', 'session_expired');
          return NextResponse.redirect(loginUrl);
        }
      } catch (sessionCheckError) {
        console.error('⚠️ Error checking session:', sessionCheckError);
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        loginUrl.searchParams.set('reason', 'session_check_failed');
        return NextResponse.redirect(loginUrl);
      }
    }

    console.log('✅ Access granted');
    return response;
    
  } catch (error) {
    console.error('❌ Middleware error:', error);
    // En caso de error, permitir el acceso para evitar romper la aplicación
    return NextResponse.next();
  }
}

// Configuración del matcher para el middleware
export const config = {
  matcher: [
    /*
     * Aplicar middleware a todas las rutas excepto:
     * - Archivos estáticos de Next.js (_next/static)
     * - Imágenes de Next.js (_next/image)
     * - favicon.ico
     * - Archivos de imagen (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};