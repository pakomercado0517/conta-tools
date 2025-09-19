// Tipos para los errores de Supabase
interface SupabaseError {
  message?: string;
  error_description?: string;
  error_code?: string;
  code?: string;
}

// Tipos para los contextos de error
type ErrorContext = 'login' | 'signup' | 'recovery' | 'reset' | 'confirm' | 'update';

// Tipo para los patrones de error
interface ErrorPattern {
  pattern: RegExp;
  translation: string;
}

/**
 * Traduce los errores de Supabase del inglés al español
 * @param errorMessage - Mensaje de error original de Supabase
 * @param errorCode - Código de error de Supabase (opcional)
 * @returns Mensaje de error traducido y contextualizado
 */
export function translateSupabaseError(
  errorMessage: string, 
  errorCode: string | null = null
): string {
  // Normalizar el mensaje para comparación
  const normalizedMessage = errorMessage.toLowerCase().trim();
  
  // Mapeo de errores comunes de Supabase
  const errorTranslations: Record<string, string> = {
    // Errores de autenticación
    'invalid login credentials': 'Credenciales inválidas. Verifica tu email y contraseña.',
    'email not confirmed': 'Tu email aún no ha sido verificado. Revisa tu bandeja de entrada y confirma tu cuenta.',
    'invalid credentials': 'Credenciales inválidas. Verifica tu email y contraseña.',
    'user not found': 'No se encontró una cuenta con ese email.',
    'wrong password': 'La contraseña es incorrecta.',
    'too many requests': 'Demasiados intentos. Espera un momento antes de volver a intentar.',
    'weak password': 'La contraseña debe tener al menos 6 caracteres.',
    'password too short': 'La contraseña debe tener al menos 6 caracteres.',
    
    // Errores de registro
    'user already registered': 'Ya existe una cuenta con este email.',
    'email already exists': 'Ya existe una cuenta con este email.',
    'signup disabled': 'El registro está temporalmente deshabilitado.',
    'email rate limit exceeded': 'Se han enviado demasiados emails. Espera antes de solicitar otro.',
    
    // Errores de email
    'email not found': 'No se encontró una cuenta con ese email.',
    'invalid email': 'El formato del email no es válido.',
    'email address not confirmed': 'Tu email aún no ha sido verificado. Revisa tu bandeja de entrada y confirma tu cuenta.',
    'email confirmation expired': 'El enlace de confirmación ha expirado. Solicita un nuevo email de verificación.',
    
    // Errores de contraseña
    'password recovery disabled': 'La recuperación de contraseña está temporalmente deshabilitada.',
    'password reset token expired': 'El enlace de recuperación ha expirado. Solicita un nuevo enlace.',
    'invalid recovery token': 'El enlace de recuperación no es válido o ha expirado.',
    'same password': 'La nueva contraseña debe ser diferente a la actual.',
    
    // Errores de sesión
    'session expired': 'Tu sesión ha expirado. Inicia sesión nuevamente.',
    'invalid session': 'Sesión inválida. Inicia sesión nuevamente.',
    'session not found': 'No se encontró una sesión válida. Inicia sesión nuevamente.',
    'unauthorized': 'No tienes autorización para realizar esta acción.',
    
    // Errores de red/servidor
    'network error': 'Error de conexión. Verifica tu conexión a internet.',
    'service unavailable': 'El servicio no está disponible temporalmente. Inténtalo más tarde.',
    'internal server error': 'Error interno del servidor. Inténtalo más tarde.',
    'timeout': 'La operación tardó demasiado. Inténtalo nuevamente.',
    
    // Errores de validación
    'invalid input': 'Los datos ingresados no son válidos.',
    'missing required fields': 'Faltan campos obligatorios.',
    'invalid format': 'El formato de los datos no es válido.',
    
    // Errores específicos de ContaTools
    'account locked': 'Tu cuenta ha sido bloqueada por seguridad. Contacta al soporte.',
    'verification required': 'Necesitas verificar tu cuenta antes de continuar.',
  };
  
  // Buscar traducción exacta
  for (const [englishError, spanishError] of Object.entries(errorTranslations)) {
    if (normalizedMessage.includes(englishError)) {
      return spanishError;
    }
  }
  
  // Errores específicos por código
  if (errorCode) {
    const codeTranslations: Record<string, string> = {
      'email_not_confirmed': 'Tu email aún no ha sido verificado. Revisa tu bandeja de entrada y confirma tu cuenta.',
      'invalid_credentials': 'Credenciales inválidas. Verifica tu email y contraseña.',
      'signup_disabled': 'El registro está temporalmente deshabilitado.',
      'email_rate_limit_exceeded': 'Se han enviado demasiados emails. Espera antes de solicitar otro.',
      'weak_password': 'La contraseña debe tener al menos 6 caracteres y ser más segura.',
      'user_already_registered': 'Ya existe una cuenta con este email.',
    };
    
    if (codeTranslations[errorCode]) {
      return codeTranslations[errorCode];
    }
  }
  
  // Patrones comunes que pueden aparecer en los mensajes
  const patterns: ErrorPattern[] = [
    {
      pattern: /email.*not.*confirm/i,
      translation: 'Tu email aún no ha sido verificado. Revisa tu bandeja de entrada y confirma tu cuenta.'
    },
    {
      pattern: /invalid.*login/i,
      translation: 'Credenciales inválidas. Verifica tu email y contraseña.'
    },
    {
      pattern: /user.*not.*found/i,
      translation: 'No se encontró una cuenta con ese email.'
    },
    {
      pattern: /email.*already.*exist/i,
      translation: 'Ya existe una cuenta con este email.'
    },
    {
      pattern: /password.*weak|weak.*password/i,
      translation: 'La contraseña debe ser más segura. Usa al menos 8 caracteres con mayúsculas, minúsculas y números.'
    },
    {
      pattern: /rate.*limit.*exceed/i,
      translation: 'Demasiados intentos. Espera un momento antes de volver a intentar.'
    },
    {
      pattern: /network.*error|connection.*error/i,
      translation: 'Error de conexión. Verifica tu conexión a internet.'
    },
    {
      pattern: /timeout|timed.*out/i,
      translation: 'La operación tardó demasiado. Inténtalo nuevamente.'
    }
  ];
  
  // Verificar patrones
  for (const { pattern, translation } of patterns) {
    if (pattern.test(normalizedMessage)) {
      return translation;
    }
  }
  
  // Si no se encuentra una traducción específica, devolver un mensaje genérico amigable
  console.warn('Untranslated Supabase error:', errorMessage, errorCode);
  
  // Mensajes genéricos según el contexto
  if (normalizedMessage.includes('email')) {
    return 'Hubo un problema con el email. Verifica que sea válido y vuelve a intentar.';
  }
  
  if (normalizedMessage.includes('password')) {
    return 'Hubo un problema con la contraseña. Verifica que cumple con los requisitos de seguridad.';
  }
  
  if (normalizedMessage.includes('login') || normalizedMessage.includes('signin')) {
    return 'Error al iniciar sesión. Verifica tus credenciales e inténtalo nuevamente.';
  }
  
  if (normalizedMessage.includes('signup') || normalizedMessage.includes('register')) {
    return 'Error al registrar la cuenta. Verifica los datos e inténtalo nuevamente.';
  }
  
  // Mensaje genérico final
  return 'Ocurrió un error inesperado. Si el problema persiste, contacta al soporte técnico.';
}

/**
 * Obtiene un mensaje de error contextualizado para mostrar al usuario
 * @param error - Error object de Supabase
 * @param context - Contexto de la operación (login, signup, recovery, etc.)
 * @returns Mensaje de error contextualizado
 */
export function getContextualError(
  error: SupabaseError | string | null, 
  context: ErrorContext | string = ''
): string {
  if (!error) return 'Ocurrió un error inesperado.';
  
  const message = typeof error === 'string' 
    ? error 
    : (error as SupabaseError).message || (error as SupabaseError).error_description || String(error);
  const code = typeof error === 'object' && error !== null 
    ? (error as SupabaseError).error_code || (error as SupabaseError).code 
    : undefined;
  
  const translatedMessage = translateSupabaseError(message, code);
  
  // Agregar contexto específico si es necesario
  const contextMessages: Record<string, string> = {
    login: 'Error al iniciar sesión: ',
    signup: 'Error al crear la cuenta: ',
    recovery: 'Error al recuperar contraseña: ',
    reset: 'Error al restablecer contraseña: ',
    confirm: 'Error al confirmar cuenta: ',
    update: 'Error al actualizar perfil: ',
  };
  
  if (context && contextMessages[context]) {
    return contextMessages[context] + translatedMessage;
  }
  
  return translatedMessage;
}

/**
 * Determina si un error indica que el email no está confirmado
 * @param error - Error object de Supabase
 * @returns true si el error indica email no confirmado
 */
export function isEmailNotConfirmedError(error: SupabaseError | null): boolean {
  if (!error) return false;
  
  const message = (error.message || '').toLowerCase();
  const code = error.error_code || error.code;
  
  return (
    message.includes('email not confirmed') ||
    message.includes('email address not confirmed') ||
    message.includes('email not verified') ||
    code === 'email_not_confirmed'
  );
}

/**
 * Determina si un error es debido a credenciales inválidas
 * @param error - Error object de Supabase
 * @returns true si el error es por credenciales inválidas
 */
export function isInvalidCredentialsError(error: SupabaseError | null): boolean {
  if (!error) return false;
  
  const message = (error.message || '').toLowerCase();
  const code = error.error_code || error.code;
  
  return (
    message.includes('invalid login credentials') ||
    message.includes('invalid credentials') ||
    message.includes('wrong password') ||
    code === 'invalid_credentials'
  );
}
