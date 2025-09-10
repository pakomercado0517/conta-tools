"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, TextInput, Label, Alert } from 'flowbite-react';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaUserPlus, FaCheckCircle } from 'react-icons/fa';
import { getContextualError } from '../../../lib/supabase/errorTranslations';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signUp, user } = useAuth();
  const router = useRouter();

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('El formato del email no es válido');
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
      const { data, error: signUpError } = await signUp(
        formData.email, 
        formData.password,
        {
          data: {
            name: formData.name
          }
        }
      );
      
      if (signUpError) {
        setError(getContextualError(signUpError, 'signup'));
      } else {
        setSuccess('¡Cuenta creada exitosamente! Revisa tu email para verificar tu cuenta de ContaTools.');
        // Limpiar el formulario
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(getContextualError(error, 'signup'));
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
              Crear Cuenta
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Únese a Conta Tools y automatiza tu contabilidad
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
                  No olvides revisar tu carpeta de spam si no encuentras el email.
                </p>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={loading}
              />
            </div>

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
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password" value="Contraseña" />
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
              <Label htmlFor="confirmPassword" value="Confirmar Contraseña" />
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
              <FaUserPlus className="mr-2" />
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
