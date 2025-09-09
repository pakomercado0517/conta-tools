"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, TextInput, Label, Alert } from 'flowbite-react';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaUserPlus } from 'react-icons/fa';

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
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El email es requerido');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al crear la cuenta');
        return;
      }

      setSuccess(true);
      // Redirigir a login después de 3 segundos
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);

    } catch (error) {
      console.error('Registration error:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <div className="text-center space-y-4">
            <div className="text-6xl text-green-500 mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ¡Cuenta creada exitosamente!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Te hemos enviado un email de verificación a <strong>{formData.email}</strong>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.
            </p>
            <div className="pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Redirigiendo a login en unos segundos...
              </p>
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                O haz clic aquí para ir al login
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
              Crear Cuenta
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Únete a Conta Tools
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert color="failure" className="text-sm">
              {error}
            </Alert>
          )}

          {/* Register Form */}
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
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Mínimo 6 caracteres
              </p>
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

          {/* Login Link */}
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
