/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuraciones de seguridad
  async headers() {
    return [
      {
        // Proteger archivos de la carpeta data/
        source: '/data/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
          },
        ],
      },
    ];
  },
  
  // Redirigir intentos de acceso directo a archivos sensibles
  async rewrites() {
    return [
      {
        source: '/data/:path*',
        destination: '/404', // Redirigir a 404 si intentan acceder
      },
    ];
  },
};

module.exports = nextConfig;
