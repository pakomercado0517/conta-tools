"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, TextInput, Label, Alert } from 'flowbite-react';
import { FaEnvelope, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { resetPassword, user } = useAuth();
  const router = useRouter();

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('El formato del email no es válido');
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await resetPassword(email);
      
      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess('Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada y spam.');
        setEmail('');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Error al enviar el correo. Inténtalo de nuevo.');
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
            <Alert color="success" className="text-sm">
              {success}
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
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              <FaPaperPlane className="mr-2" />
              {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Recordaste tu contraseña?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Iniciar sesión
              </Link>
            </p>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No tienes una cuenta?{' '}
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
