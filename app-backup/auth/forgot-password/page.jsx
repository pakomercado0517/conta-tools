"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button, TextInput, Label, Alert } from "flowbite-react";
import { FaEnvelope, FaArrowLeft, FaPaperPlane } from "react-icons/fa";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email.trim()) {
      setError("El email es requerido");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error al procesar la solicitud");
        return;
      }

      setSuccess(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <div className="space-y-4 text-center">
            <div className="mb-4 text-6xl text-blue-500">📧</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ¡Email enviado!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Si el email <strong>{email}</strong> está registrado en nuestro
              sistema, recibirás instrucciones para resetear tu contraseña.
            </p>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Revisa tu bandeja de entrada</strong> y también la
                carpeta de spam. El enlace de recuperación expira en 1 hora.
              </p>
            </div>
            <div className="pt-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                <FaArrowLeft className="mr-2" />
                Volver al login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recuperar Contraseña
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Ingresa tu email y te enviaremos instrucciones para resetear tu
              contraseña
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert color="failure" className="text-sm">
              {error}
            </Alert>
          )}

          {/* Forgot Password Form */}
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
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email.trim()}
            >
              <FaPaperPlane className="mr-2" />
              {loading ? "Enviando..." : "Enviar Instrucciones"}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaArrowLeft className="mr-2" />
              Volver al login
            </Link>
          </div>

          {/* Additional Help */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>¿Problemas para acceder?</strong> Asegúrate de usar el
              mismo email con el que te registraste. Si sigues teniendo
              problemas, contacta a soporte.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
