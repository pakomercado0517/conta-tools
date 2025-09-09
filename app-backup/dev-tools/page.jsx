"use client";

import { useState } from "react";
import { Card, Button, TextInput, Label, Alert } from "flowbite-react";
import { FaEnvelope, FaCheck, FaEye } from "react-icons/fa";

export default function DevToolsPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [users, setUsers] = useState([]);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== "development") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="py-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Página no disponible
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Esta página solo está disponible en modo desarrollo.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/dev-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Error al verificar");
        setMessageType("failure");
        return;
      }

      setMessage(data.message);
      setMessageType("success");
      setEmail("");
    } catch (error) {
      console.error("Verification error:", error);
      setMessage("Error al conectar con el servidor");
      setMessageType("failure");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Leer directamente el archivo de usuarios para mostrar el estado
      const response = await fetch("/api/auth/dev-list-users");
      // Como no hemos implementado esta API, mostramos información básica
      setMessage(
        "Para ver usuarios registrados, revisa el archivo data/users.json",
      );
      setMessageType("info");
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          🛠️ Herramientas de Desarrollo
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Herramientas para desarrollo y testing (solo disponible en desarrollo)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Verificar Email Manualmente */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FaCheck className="text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Verificar Email Manualmente
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Como los emails no se están enviando por problemas de
              configuración de Gmail, usa esta herramienta para verificar
              cuentas manualmente.
            </p>

            {message && (
              <Alert color={messageType} className="text-sm">
                {message}
              </Alert>
            )}

            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <Label htmlFor="email" value="Email del usuario a verificar" />
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  icon={FaEnvelope}
                  placeholder="usuario@ejemplo.com"
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
                <FaCheck className="mr-2" />
                {loading ? "Verificando..." : "Verificar Email"}
              </Button>
            </form>
          </div>
        </Card>

        {/* Información de Usuarios */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FaEye className="text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Estado de Usuarios
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Los usuarios registrados se almacenan en el archivo{" "}
              <code>data/users.json</code>. Puedes revisarlo directamente para
              ver el estado de verificación.
            </p>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                Proceso de verificación manual:
              </h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Usuario se registra (cuenta creada pero no verificada)</li>
                <li>Usar esta herramienta para verificar el email</li>
                <li>Usuario puede hacer login normalmente</li>
              </ol>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <h4 className="mb-2 font-medium text-yellow-800 dark:text-yellow-200">
                📧 Configurar Gmail correctamente:
              </h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                <li>Ve a tu cuenta de Gmail</li>
                <li>Habilita verificación en 2 pasos</li>
                <li>Ve a &quot;App passwords&quot;</li>
                <li>Genera una nueva contraseña de aplicación</li>
                <li>Usa esa contraseña en EMAIL_SERVER_PASSWORD</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
