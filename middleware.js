import { NextResponse } from 'next/server';

// Middleware simplificado sin NextAuth para debug
export function middleware(request) {
  console.log('🔍 Simple middleware check:', request.nextUrl.pathname);
  
  // Por ahora, permitir acceso a todas las rutas
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Aplicar middleware a todas las rutas excepto:
    // - API de autenticación (/api/auth/*)
    // - Assets estáticos (_next/static, _next/image, favicon.ico)
    // - Rutas de autenticación (/auth/*)
    // - Herramientas de desarrollo (/dev-tools)
    '/((?!api/auth|_next/static|_next/image|favicon.ico|auth|dev-tools).*)',
  ],
};
