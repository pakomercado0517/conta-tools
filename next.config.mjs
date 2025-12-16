import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para paquetes externos del servidor (actualizado para Next.js 16)
  // Estos paquetes solo funcionan en Node.js y no deben ser empaquetados por webpack
  serverExternalPackages: ["pg", "bcryptjs", "canvas", "pdfjs-dist"],

  // Webpack config para PostgreSQL y módulos nativos
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.externals.push("pg-native");
    }

    // Configurar loaders para ignorar archivos .node (módulos nativos)
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    // Ignorar módulos nativos en el cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },

  // Configuración TypeScript durante la migración
  typescript: {
    // Permitir builds durante la migración gradual
    ignoreBuildErrors: true,
  },

  // Configuración de Turbopack (vacía para silenciar el warning)
  // Usamos webpack explícitamente con el flag --webpack en los scripts
  turbopack: {},
};

export default nextConfig;
