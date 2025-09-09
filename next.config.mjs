/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones para producción y App Router
  experimental: {
    serverComponentsExternalPackages: ['pg', 'bcryptjs'],
  },
  
  // Configuración para NextAuth en entornos serverless
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('pg-native');
    }
    return config;
  },
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/api/auth/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ],
      },
    ];
  },
};

export default nextConfig;
