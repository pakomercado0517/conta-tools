"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, Button, Spinner } from "flowbite-react";
import { FaCheck, FaTimes, FaArrowLeft, FaSignInAlt } from "react-icons/fa";

function VerifyEmailContent() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Token de verificación no válido o faltante");
      setLoading(false);
      return;
    }
    setToken(tokenParam);
    verifyEmail(tokenParam);
  }, [searchParams]);

  const verifyEmail = async (verificationToken) => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: verificationToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error al verificar el email");
        return;
      }

      setSuccess(true);
    } catch (error) {
      console.error("Email verification error:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <div className="space-y-4 text-center">
            <Spinner size="xl" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Verificando tu email...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Por favor, espera mientras procesamos tu verificación
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <div className="space-y-4 text-center">
            <div className="mb-4 text-6xl text-green-500">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ¡Email verificado exitosamente!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ¡Bienvenido a Conta Tools! Tu cuenta ha sido activada y ya puedes
              acceder a todas las funcionalidades.
            </p>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>¿Qué puedes hacer ahora?</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
                <li>• Generar contratos de compraventa profesionales</li>
                <li>• Gestionar facturas y documentos</li>
                <li>• Acceder a herramientas contables</li>
                <li>• Personalizar tu perfil</li>
              </ul>
            </div>

            <div className="space-y-2 pt-4">
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full"
              >
                <FaSignInAlt className="mr-2" />
                Iniciar Sesión
              </Button>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ya puedes iniciar sesión con tus credenciales
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <div className="space-y-4 text-center">
            <div className="mb-4 text-6xl text-red-500">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Error de Verificación
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Posibles causas:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300">
                <li>
                  • El enlace ha expirado (los enlaces expiran en 24 horas)
                </li>
                <li>• El enlace ya fue usado anteriormente</li>
                <li>• El token no es válido</li>
              </ul>
            </div>

            <div className="space-y-2 pt-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                <FaArrowLeft className="mr-2" />
                Volver al login
              </Link>

              <p className="text-xs text-gray-500 dark:text-gray-500">
                Si el problema persiste, contacta al soporte técnico
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md">
            <div className="space-y-4 text-center">
              <Spinner size="xl" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cargando verificación...
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Preparando la verificación de tu email
              </p>
            </div>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
