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
};

export default nextConfig;
