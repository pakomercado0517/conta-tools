import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Middleware adicional si es necesario
    console.log('Protected route accessed:', req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        console.log('🔍 Middleware check:', {
          pathname,
          hasToken: !!token,
          emailVerified: token?.emailVerified
        });
        
        // Rutas públicas (no requieren login)
        const publicRoutes = [
          '/',
          '/counterMoney',
          '/getCosts', 
          '/sdiCalculator',
          '/generador_conceptos',
          '/licensing',
          '/verify-email'  // Temporalmente pública para tokens expirados
        ];

        // Rutas que requieren login pero NO email verificado
        const loginOnlyRoutes = [
          '/profile',
          '/verify-email'
        ];
        
        // Rutas protegidas (requieren login + email verificado)
        const protectedRoutes = [
          '/dashboard',
          '/generador_contratos',
          '/quotation',
          '/paybackInformation',
          '/facturas'
        ];
        
        // Si es una ruta pública, permitir acceso sin autenticación
        const isPublicRoute = publicRoutes.some(route => 
          pathname === route || pathname.startsWith(route + '/')
        );
        
        console.log('🌍 Public route check:', { isPublicRoute });
        if (isPublicRoute) {
          console.log('✅ Allowing public route');
          return true;
        }

        // Si no hay token (no autenticado), denegar acceso
        if (!token) {
          console.log('❌ No token, denying access');
          return false;
        }
        
        // Verificar si es una ruta que solo requiere login (sin verificación)
        const isLoginOnlyRoute = loginOnlyRoutes.some(route => 
          pathname.startsWith(route)
        );
        
        console.log('🔐 Login-only route check:', { isLoginOnlyRoute, pathname, loginOnlyRoutes });
        if (isLoginOnlyRoute) {
          console.log('✅ Allowing login-only route');
          return true; // Solo requiere estar logueado
        }

        // Para rutas protegidas, requerir que el email esté verificado
        const isProtectedRoute = protectedRoutes.some(route => 
          pathname.startsWith(route)
        );

        if (isProtectedRoute && !token.emailVerified) {
          console.log('❌ Protected route requires verified email, denying access');
          return false;
        }

        console.log('✅ Access granted');
        return true;
      },
    },
  }
);

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
