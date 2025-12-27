"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, TextInput, Label, Alert } from "flowbite-react";
import {
  FaEnvelope,
  FaArrowLeft,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";
import { getContextualError } from "../../../lib/supabase/errorTranslations";

/**
 * Página de recuperación de contraseña
 * Permite al usuario enviar un enlace de recuperación a su email
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const { resetPassword, user } = useAuth();
  const router = useRouter();

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  /**
   * Valida el formato del email
   * @param email - Email a validar
   * @returns true si el email es válido
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Maneja el envío del formulario de recuperación
   * @param e - Evento del formulario
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email) {
      setError("Por favor, ingresa tu correo electrónico");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("El formato del email no es válido");
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await resetPassword(email);

      if (resetError) {
        setError(getContextualError(resetError, "recovery"));
      } else {
        setSuccess(
          "Se ha enviado un enlace de recuperación a tu correo electrónico de ContaTools. Revisa tu bandeja de entrada y spam."
        );
        setEmail("");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setError(getContextualError(error, "recovery"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recuperar Contraseña
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Ingresa tu email para recibir un enlace de recuperación
            </p>
          </div>

          {error && (
            <Alert color="failure" className="text-sm">
              {error}
            </Alert>
          )}

          {success && (
            <Alert color="success" className="text-sm" icon={FaCheckCircle}>
              <div>
                <p className="font-medium">¡Enlace enviado! 🚀</p>
                <p className="mt-1 text-xs">{success}</p>
                <p className="mt-1 text-xs text-amber-600">
                  ⚠️ El enlace expira en 1 hora por seguridad.
                </p>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" value="Correo Electrónico" />
              <TextInput
                id="email"
                name="email"
                type="email"
                icon={FaEnvelope}
                placeholder="tu@email.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <FaPaperPlane className="mr-2" />
              {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
            </Button>
          </form>

          <div className="space-y-2 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Recordaste tu contraseña?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Iniciar sesión
              </Link>
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Crear cuenta
              </Link>
            </p>

            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaArrowLeft className="mr-2" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
