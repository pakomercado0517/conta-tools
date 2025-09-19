"use client";

import { useState, useEffect, Suspense, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, TextInput, Label, Alert } from 'flowbite-react';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaSignInAlt, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { getContextualError, isEmailNotConfirmedError } from '@/lib/supabase/errorTranslations';
import type { LoginPageProps, LoginFormData, AuthFormState } from '@/types/pages';

/**
 * Contenido principal de la página de login
 * Separado del componente de página para manejar Suspense correctamente
 */
function LoginContent() {
  // Estado del formulario
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  
  // Estado de la UI
  const [formState, setFormState] = useState<AuthFormState>({
    loading: false,
    error: '',
    isEmailNotConfirmed: false,
    showPassword: false
  });
  
  // Hooks de autenticación y navegación
  const { signIn, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (user) {
      router.push(redirectTo);
    }
  }, [user, router, redirectTo]);

  /**
   * Manejar cambios en los inputs del formulario
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Alternar visibilidad de la contraseña
   */
  const togglePasswordVisibility = (): void => {
    setFormState(prev => ({
      ...prev,
      showPassword: !prev.showPassword
    }));
  };

  /**
   * Manejar envío del formulario de login
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    setFormState(prev => ({
      ...prev,
      loading: true,
      error: '',
      isEmailNotConfirmed: false
    }));

    // Validación básica
    if (!formData.email || !formData.password) {
      setFormState(prev => ({
        ...prev,
        error: 'Por favor, completa todos los campos',
        loading: false
      }));
      return;
    }

    try {
      const { data, error: signInError } = await signIn(formData.email, formData.password);
      
      if (signInError) {
        const isEmailError = isEmailNotConfirmedError(signInError);
        setFormState(prev => ({
          ...prev,
          isEmailNotConfirmed: isEmailError,
          error: getContextualError(signInError, 'login'),
          loading: false
        }));
      } else if (data && data.user) {
        // Login exitoso, la redireccion se maneja via useEffect
        console.log('Login successful');
      }
    } catch (error) {
      console.error('Login error:', error);
      setFormState(prev => ({
        ...prev,
        error: getContextualError(error, 'login'),
        loading: false
      }));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          <header className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Iniciar Sesión
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Accede a tu cuenta de Conta Tools
            </p>
          </header>
          
          {/* Alert de error */}
          {formState.error && (
            <Alert 
              color={formState.isEmailNotConfirmed ? "warning" : "failure"} 
              className="text-sm"
              icon={formState.isEmailNotConfirmed ? FaExclamationTriangle : undefined}
            >
              <div className="flex flex-col gap-2">
                <span>{formState.error}</span>
                {formState.isEmailNotConfirmed && (
                  <div className="text-xs">
                    <FaInfoCircle className="inline mr-1" />
                    <Link 
                      href="/auth/resend-confirmation" 
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Reenviar email de confirmación
                    </Link>
                  </div>
                )}
              </div>
            </Alert>
          )}

          {/* Formulario de login */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  type={formState.showPassword ? 'text' : 'password'}
                  icon={FaLock}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={formState.loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={formState.loading}
                  aria-label={formState.showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {formState.showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Enlace de recuperación */}
            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón de envío */}
            <Button
              type="submit"
              className="w-full"
              disabled={formState.loading}
            >
              <FaSignInAlt className="mr-2" />
              {formState.loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Enlace de registro */}
          <footer className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Regístrate aquí
              </Link>
            </p>
          </footer>
        </div>
      </Card>
    </div>
  );
}

/**
 * Página de login con Suspense para manejar useSearchParams
 */
export default function LoginPage(_props: LoginPageProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}