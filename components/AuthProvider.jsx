// AuthProvider eliminado - se usará Supabase en el futuro
"use client";

export default function AuthProvider({ children }) {
  // Simple wrapper sin autenticación por ahora
  return <>{children}</>;
}
