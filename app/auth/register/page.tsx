"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, TextInput, Label, Alert } from "flowbite-react";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUser,
  FaUserPlus,
  FaCheckCircle,
} from "react-icons/fa";
import { getContextualError } from "@/lib/supabase/errorTranslations";
import type { RegisterPageProps, RegisterFormData } from "@/types/pages";

// Estado extendido para registro que incluye campos adicionales
interface RegisterFormState {
  loading: boolean;
  error: string;
  success: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

/**
 * Página de registro de nuevos usuarios
 * Permite crear cuentas con validaciones completas
 */
export default function RegisterPage(_props: RegisterPageProps) {
  // Estado del formulario
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Estado de la UI
  const [formState, setFormState] = useState<RegisterFormState>({
    loading: false,
    error: "",
    success: "",
    showPassword: false,
    showConfirmPassword: false,
  });

  const { signUp, user } = useAuth();
  const router = useRouter();

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  /**
   * Manejar cambios en los inputs del formulario
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Validar formulario de registro
   */
  const validateForm = (): boolean => {
    // Verificar que todos los campos estén completos
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setFormState((prev) => ({
        ...prev,
        error: "Por favor, completa todos los campos",
      }));
      return false;
    }

    // Verificar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setFormState((prev) => ({
        ...prev,
        error: "Las contraseñas no coinciden",
      }));
      return false;
    }

    // Verificar longitud mínima de contraseña
    if (formData.password.length < 6) {
      setFormState((prev) => ({
        ...prev,
        error: "La contraseña debe tener al menos 6 caracteres",
      }));
      return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormState((prev) => ({
        ...prev,
        error: "El formato del email no es válido",
      }));
      return false;
    }

    // Validar nombre (al menos 2 caracteres)
    if (formData.name.trim().length < 2) {
      setFormState((prev) => ({
        ...prev,
        error: "El nombre debe tener al menos 2 caracteres",
      }));
      return false;
    }

    return true;
  };

  /**
   * Manejar envío del formulario de registro
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    setFormState((prev) => ({
      ...prev,
      loading: true,
      error: "",
      success: "",
    }));

    if (!validateForm()) {
      setFormState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        {
          data: {
            name: formData.name?.trim() || "",
          },
        }
      );

      if (signUpError) {
        setFormState((prev) => ({
          ...prev,
          error: getContextualError(signUpError, "signup"),
          loading: false,
        }));
      } else {
        setFormState((prev) => ({
          ...prev,
          success:
            "¡Cuenta creada exitosamente! Revisa tu email para verificar tu cuenta de ContaTools.",
          loading: false,
        }));

        // Limpiar el formulario
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setFormState((prev) => ({
        ...prev,
        error: getContextualError(error, "signup"),
        loading: false,
      }));
    }
  };

  /**
   * Alternar visibilidad de contraseña principal
   */
  const togglePasswordVisibility = (): void => {
    setFormState((prev) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  };

  /**
   * Alternar visibilidad de confirmación de contraseña
   */
  const toggleConfirmPasswordVisibility = (): void => {
    setFormState((prev) => ({
      ...prev,
      showConfirmPassword: !prev.showConfirmPassword,
    }));
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          <header className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Crear Cuenta
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Únete a Conta Tools y automatiza tu contabilidad
            </p>
          </header>

          {/* Alert de error */}
          {formState.error && (
            <Alert color="failure" className="text-sm">
              {formState.error}
            </Alert>
          )}

          {/* Alert de éxito */}
          {formState.success && (
            <Alert color="success" className="text-sm" icon={FaCheckCircle}>
              <div>
                <p className="font-medium">{formState.success}</p>
                <p className="mt-1 text-xs">
                  No olvides revisar tu carpeta de spam si no encuentras el
                  email.
                </p>
              </div>
            </Alert>
          )}

          {/* Formulario de registro */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo de nombre */}
            <div>
              <Label htmlFor="name" value="Nombre Completo" />
              <TextInput
                id="name"
                name="name"
                type="text"
                icon={FaUser}
                placeholder="Tu nombre completo"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={formState.loading}
                autoComplete="name"
                minLength={2}
                maxLength={100}
              />
            </div>

            {/* Campo de email */}
            <div>
              <Label htmlFor="email" value="Correo Electrónico" />
              <TextInput
                id="email"
                name="email"
                type="email"
                icon={FaEnvelope}
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={formState.loading}
                autoComplete="email"
              />
            </div>

            {/* Campo de contraseña */}
            <div>
              <Label htmlFor="password" value="Contraseña" />
              <div className="relative">
                <TextInput
                  id="password"
                  name="password"
                  type={formState.showPassword ? "text" : "password"}
                  icon={FaLock}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={formState.loading}
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={formState.loading}
                  aria-label={
                    formState.showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {formState.showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Campo de confirmación de contraseña */}
            <div>
              <Label htmlFor="confirmPassword" value="Confirmar Contraseña" />
              <div className="relative">
                <TextInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type={formState.showConfirmPassword ? "text" : "password"}
                  icon={FaLock}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={formState.loading}
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={formState.loading}
                  aria-label={
                    formState.showConfirmPassword
                      ? "Ocultar confirmación"
                      : "Mostrar confirmación"
                  }
                >
                  {formState.showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Botón de envío */}
            <Button
              type="submit"
              className="w-full"
              disabled={formState.loading}
            >
              <FaUserPlus className="mr-2" />
              {formState.loading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>

          {/* Enlace de login */}
          <footer className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </footer>
        </div>
      </Card>
    </div>
  );
}
