"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, TextInput, Label, Alert } from 'flowbite-react';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaSignInAlt, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { getContextualError, isEmailNotConfirmedError } from '../../../lib/supabase/errorTranslations';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await signIn(email, password);
      
      if (signInError) {
        const isEmailError = isEmailNotConfirmedError(signInError);
        setIsEmailNotConfirmed(isEmailError);
        setError(getContextualError(signInError, 'login'));
      } else if (data.user) {
        // Successful login, redirect will happen via useEffect
        console.log('Login successful');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(getContextualError(error, 'login'));
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
              Iniciar Sesión
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Accede a tu cuenta de Conta Tools
            </p>
          </div>
          
          {error && (
            <Alert 
              color={isEmailNotConfirmed ? "warning" : "failure"} 
              className="text-sm"
              icon={isEmailNotConfirmed ? FaExclamationTriangle : undefined}
            >
              <div className="flex flex-col gap-2">
                <span>{error}</span>
                {isEmailNotConfirmed && (
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" value="Correo Electrónico" />
              <TextInput
                id="email"
                type="email"
                icon={FaEnvelope}
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password" value="Contraseña" />
              <div className="relative">
                <TextInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  icon={FaLock}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              <FaSignInAlt className="mr-2" />
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
