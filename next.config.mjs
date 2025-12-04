/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para paquetes externos del servidor (actualizado para Next.js 16)
  serverExternalPackages: ['pg', 'bcryptjs'],
  
  // Webpack config para PostgreSQL (se mantiene para compatibilidad)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('pg-native');
    }
    return config;
  },
  
  // Configuración TypeScript durante la migración
  typescript: {
    // Permitir builds durante la migración gradual
    ignoreBuildErrors: true,
  },
  
  // Configuración de Turbopack (Next.js 16 usa Turbopack por defecto)
  // Si necesitas webpack explícitamente, puedes pasar --webpack al comando dev
  // Por ahora, dejamos Turbopack habilitado y webpack como fallback
};

export default nextConfig;