"use client";

import { Card, Alert } from 'flowbite-react';
import { FaEnvelopeOpenText, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

/**
 * Página de verificación de email
 * Informa al usuario sobre el proceso de verificación
 */
export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="space-y-6 text-center">
          {/* Ícono de verificación */}
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900">
              <FaEnvelopeOpenText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          {/* Título y descripción */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Verifica tu Email
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Te hemos enviado un correo de verificación
            </p>
          </div>
          
          {/* Alerta informativa */}
          <Alert color="info" className="text-left">
            <div className="space-y-2">
              <p className="font-medium">📧 Revisa tu bandeja de entrada</p>
              <p className="text-sm">
                Hemos enviado un enlace de verificación a tu correo electrónico. 
                Por favor, haz clic en el enlace para activar tu cuenta de ContaTools.
              </p>
              <p className="text-xs text-amber-600">
                ⚠️ No olvides revisar tu carpeta de spam si no lo encuentras.
              </p>
            </div>
          </Alert>
          
          {/* Instrucciones */}
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              Una vez que verifiques tu email, podrás acceder a todas las herramientas de ContaTools.
            </p>
            <p>
              Si no recibes el correo en unos minutos, puedes solicitar otro enlace.
            </p>
          </div>
          
          {/* Botones de acción */}
          <div className="space-y-3">
            <Link
              href="/auth/resend-verification"
              className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Reenviar correo de verificación
            </Link>
            
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </div>
          
          {/* Información de soporte */}
          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ¿Tienes problemas? Contáctanos en{' '}
              <a 
                href="mailto:support@conta-tools.com" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                support@conta-tools.com
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
