"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Button, Alert, Spinner } from "flowbite-react";
import {
  FaEnvelope,
  FaCheck,
  FaExclamationTriangle,
  FaArrowLeft,
  FaHome,
} from "react-icons/fa";
import Link from "next/link";

export default function VerifyEmailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estados para reenvío de verificación
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState({ type: "", text: "" });
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    // Si ya está verificado, redirigir al dashboard
    if (session.user?.emailVerified) {
      router.push("/dashboard");
      return;
    }

    setInitialLoading(false);
  }, [session, status, router]);

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/user/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage({ type: "success", text: data.message });
      } else {
        setResendMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setResendMessage({
        type: "error",
        text: "Error enviando el email de verificación",
      });
    } finally {
      setResendLoading(false);
    }
  };

  // Mostrar loading mientras carga la sesión
  if (status === "loading" || initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Se redirigirá automáticamente
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <FaArrowLeft className="mr-2" />
              Volver al inicio
            </Link>

            <Link
              href="/profile/edit"
              className="inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaHome className="mr-2" />
              Mi Perfil
            </Link>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
              <FaEnvelope className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Verifica tu Email
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Necesitas verificar tu dirección de email para acceder a todas las
              funcionalidades
            </p>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="mx-auto max-w-2xl">
          <Card>
            <div className="space-y-6">
              {/* Información del usuario */}
              <div className="border-b border-gray-200 pb-6 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {session.user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {session.user?.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alerta de estado */}
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
                <div className="flex items-start">
                  <FaExclamationTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Tu email no está verificado
                    </h4>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>
                        Para acceder a todas las funcionalidades de Conta Tools,
                        necesitas verificar tu dirección de email.
                      </p>
                      <p className="mt-1">
                        El token de verificación puede haber expirado, pero
                        puedes solicitar uno nuevo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensaje de respuesta */}
              {resendMessage.text && (
                <Alert
                  color={
                    resendMessage.type === "success" ? "success" : "failure"
                  }
                  icon={
                    resendMessage.type === "success"
                      ? FaCheck
                      : FaExclamationTriangle
                  }
                >
                  {resendMessage.text}
                </Alert>
              )}

              {/* Botón para reenviar */}
              <div className="space-y-4">
                <div>
                  <h4 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
                    Reenviar Email de Verificación
                  </h4>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Si no recibiste el email de verificación o si expiró, puedes
                    solicitar uno nuevo. Revisa también tu carpeta de spam.
                  </p>
                  <Button
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    size="lg"
                    className="w-full"
                    color="warning"
                  >
                    {resendLoading ? (
                      <>
                        <Spinner size="sm" light className="mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <FaEnvelope className="mr-2" />
                        Reenviar Email de Verificación
                      </>
                    )}
                  </Button>
                </div>

                {/* Instrucciones */}
                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Instrucciones:
                  </h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      Haz clic en &quot;Reenviar Email de Verificación&quot;
                    </li>
                    <li>Revisa tu bandeja de entrada y carpeta de spam</li>
                    <li>
                      Haz clic en el enlace del email para verificar tu cuenta
                    </li>
                    <li>
                      Una vez verificado, podrás acceder a todas las
                      funcionalidades
                    </li>
                  </ol>
                </div>

                {/* Beneficios de verificar */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
                  <div className="flex items-start">
                    <FaCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        ¿Por qué verificar tu email?
                      </h4>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <ul className="list-inside list-disc space-y-1">
                          <li>
                            Acceso completo a todas las herramientas de
                            contabilidad
                          </li>
                          <li>Generación de contratos y cotizaciones</li>
                          <li>Gestión de facturas y documentos</li>
                          <li>Seguridad adicional para tu cuenta</li>
                          <li>Recuperación de contraseña si la olvidas</li>
                          <li>Notificaciones importantes por email</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Información adicional */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¿Problemas con la verificación? Contacta al soporte técnico.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
