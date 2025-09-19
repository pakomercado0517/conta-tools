// =====================================
// TIPOS PARA LAYOUTS DE NEXT.JS
// =====================================

import { Metadata } from 'next';
import { ReactNode } from 'react';

// Props para RootLayout
export interface RootLayoutProps {
  children: ReactNode;
}

// Configuración para metadatos estáticos
export interface StaticMetadata extends Metadata {
  title: string;
  description: string;
}

// Props para layouts de página específicos
export interface PageLayoutProps {
  children: ReactNode;
  params?: Record<string, string>;
}

// Props para layouts con parámetros dinámicos
export interface DynamicLayoutProps {
  children: ReactNode;
  params: {
    [key: string]: string | string[];
  };
}

// Nota: Las fuentes de Google de Next.js se configuran directamente
// sin necesidad de interfaces personalizadas

// Props para componentes de layout condicional
export interface ConditionalLayoutProps {
  children: ReactNode;
  condition?: boolean;
  fallback?: ReactNode;
}

// Props para layout de autenticación
export interface AuthLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}