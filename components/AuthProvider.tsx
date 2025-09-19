"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '../lib/supabase/client';
import type { 
  User, 
  Session, 
  SupabaseClient, 
  AuthError,
  AuthTokenResponse,
  UserResponse
} from '@supabase/supabase-js';

// Tipos para las respuestas de autenticación
interface AuthResponse {
  data: AuthTokenResponse['data'] | null;
  error: AuthError | null;
}

interface SignOutResponse {
  error: AuthError | null;
}

interface ResetPasswordResponse {
  data: {} | null;
  error: AuthError | null;
}

interface UpdatePasswordResponse {
  data: UserResponse['data'];
  error: AuthError | null;
}

// Tipos para opciones de registro
interface SignUpOptions {
  data?: Record<string, unknown>;
  captchaToken?: string;
}

// Interface para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, options?: SignUpOptions) => Promise<AuthResponse>;
  signOut: () => Promise<SignOutResponse>;
  resetPassword: (email: string) => Promise<ResetPasswordResponse>;
  updatePassword: (newPassword: string) => Promise<UpdatePasswordResponse>;
}

// Props del AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Crear el contexto con tipo undefined inicialmente
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Proveedor de contexto de autenticación usando Supabase
 * @param children - Componentes hijos que tendrán acceso al contexto
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClient();

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async (): Promise<void> => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  /**
   * Iniciar sesión con email y contraseña
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Respuesta de autenticación
   */
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  /**
   * Registrar nuevo usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @param options - Opciones adicionales para el registro
   * @returns Respuesta de autenticación
   */
  const signUp = async (
    email: string, 
    password: string, 
    options: SignUpOptions = {}
  ): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    });
    return { data, error } as AuthResponse;
  };

  /**
   * Cerrar sesión
   * Limpia la sesión tanto en el cliente como en el servidor
   * @returns Respuesta de cierre de sesión
   */
  const signOut = async (): Promise<SignOutResponse> => {
    try {
      // 1. Limpiar estado del usuario inmediatamente para evitar acceso temporal
      setUser(null);
      
      // 2. Cerrar sesión en Supabase (limpia cookies y tokens)
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Cerrar sesión en todas las pestañas/dispositivos
      });
      
      // 3. Limpiar datos del localStorage por si acaso
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1] + '-auth-token');
        sessionStorage.clear();
      }
      
      // 4. Forzar recarga de la página para limpiar cualquier estado residual
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      
      return { error };
    } catch (err) {
      console.error('Error during sign out:', err);
      // Aún así, limpiar estado local
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return { error: err as AuthError };
    }
  };

  /**
   * Solicitar reseteo de contraseña
   * @param email - Email del usuario
   * @returns Respuesta de reseteo
   */
  const resetPassword = async (email: string): Promise<ResetPasswordResponse> => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  };

  /**
   * Actualizar contraseña del usuario autenticado
   * @param newPassword - Nueva contraseña
   * @returns Respuesta de actualización
   */
  const updatePassword = async (newPassword: string): Promise<UpdatePasswordResponse> => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { data, error };
  };

  const value: AuthContextType = {
    user,
    loading,
    supabase,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para usar el contexto de autenticación
 * @returns Contexto de autenticación
 * @throws Error si se usa fuera de AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}