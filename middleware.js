import { createClient } from './lib/supabase/middleware';

export async function middleware(request) {
  const { supabase, response } = createClient(request);
  const { pathname } = request.nextUrl;

  console.log('🔍 Supabase middleware check:', pathname);

  // Rutas públicas (no requieren autenticación)
  const publicRoutes = [
    '/',
    '/counterMoney',
    '/getCosts',
    '/sdiCalculator', 
    '/generador_conceptos',
    '/licensing',
    '/dev-tools'
  ];

  // Rutas de autenticación (redirigir si ya está autenticado)
  const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
  ];

  // Rutas protegidas (requieren autenticación)
  const protectedRoutes = [
    '/dashboard',
    '/generador_contratos',
    '/quotation',
    '/paybackInformation',
    '/profile'
  ];

  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  
  console.log('👤 User status:', {
    authenticated: !!user,
    email: user?.email,
    pathname
  });

  // Si es una ruta pública, permitir acceso
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (isPublicRoute) {
    console.log('✅ Public route, allowing access');
    return response;
  }

  // Si es una ruta de auth y el usuario está autenticado, redirigir al dashboard
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  if (isAuthRoute && user) {
    console.log('↩️  Already authenticated, redirecting to dashboard');
    return Response.redirect(new URL('/dashboard', request.url));
  }

  // Si es una ruta protegida y no hay usuario, redirigir al login
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedRoute && !user) {
    console.log('❌ Protected route without auth, redirecting to login');
    return Response.redirect(
      new URL(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  console.log('✅ Access granted');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
