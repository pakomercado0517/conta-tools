/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración limpia para uso con Supabase
  experimental: {
    serverComponentsExternalPackages: ['pg', 'bcryptjs'],
  },
  
  // Webpack config para PostgreSQL
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
  
  // Configuración ESLint durante la migración
  eslint: {
    // Permitir builds con warnings de ESLint durante la migración
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;