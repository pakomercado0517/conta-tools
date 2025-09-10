"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, TextInput, Label, Alert } from 'flowbite-react';
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaCheckCircle } from 'react-icons/fa';
import { getContextualError } from '../../../lib/supabase/errorTranslations';

function ResetPasswordContent() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { updatePassword, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar si tenemos los parámetros necesarios en la URL
    const access_token = searchParams.get('access_token');
    const refresh_token = searchParams.get('refresh_token');
    
    if (!access_token && !user) {
      setError('Enlace de recuperación inválido o expirado. Por favor, solicita un nuevo enlace.');
    }
  }, [searchParams, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError('Por favor, completa todos los campos');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await updatePassword(formData.password);
      
      if (updateError) {
        setError(getContextualError(updateError, 'reset'));
      } else {
        setSuccess('¡Contraseña actualizada exitosamente! Serás redirigido a ContaTools...');
        // Limpiar el formulario
        setFormData({
          password: '',
          confirmPassword: ''
        });
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Password update error:', error);
      setError(getContextualError(error, 'reset'));
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
              Nueva Contraseña
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Ingresa tu nueva contraseña para tu cuenta
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
                <p className="font-medium">{success}</p>
                <p className="text-xs mt-1">
                  🔐 Tu cuenta de ContaTools ahora está más segura.
                </p>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" value="Nueva Contraseña" />
              <div className="relative">
                <TextInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  icon={FaLock}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
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

            <div>
              <Label htmlFor="confirmPassword" value="Confirmar Nueva Contraseña" />
              <div className="relative">
                <TextInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  icon={FaLock}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={loading}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              <FaCheck className="mr-2" />
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Problemas con el enlace?{' '}
              <Link
                href="/auth/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Solicitar nuevo enlace
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
