import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ConditionalLayout from "@/components/ConditionalLayout";
import type { RootLayoutProps } from "@/types/layout";

const oswald = localFont({
  src: "./fonts/oswald-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
});

// Metadatos estáticos de la aplicación
export const metadata: Metadata = {
  title: "ContaTools",
  description: "Herramientas contables del día a día",
  keywords: [
    "contabilidad",
    "herramientas",
    "contratos",
    "cotizaciones",
    "facturación",
    "finanzas",
  ],
  authors: [
    {
      name: "TresA Design",
    },
  ],
  creator: "TresA Design",
  publisher: "TresA Design",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://conta-tools.vercel.app",
    title: "ContaTools",
    description: "Herramientas contables del día a día",
    siteName: "ContaTools",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContaTools",
    description: "Herramientas contables del día a día",
  },
};

// Configuración del viewport
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

/**
 * Layout raíz de la aplicación Next.js
 * Proporciona la estructura HTML base y configuración global
 *
 * @param children - Contenido de la página que se renderizará
 * @returns JSX del layout raíz con proveedores y estructura global
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${oswald.className} relative bg-white/80 shadow-md backdrop-blur-md dark:bg-gray-900/80 dark:backdrop-blur-md`}
        suppressHydrationWarning
      >
        {/* Proveedor de autenticación global */}
        <AuthProvider>
          {/* Layout condicional basado en autenticación */}
          <ConditionalLayout>{children}</ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
