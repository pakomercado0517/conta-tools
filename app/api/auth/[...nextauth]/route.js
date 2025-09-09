import NextAuth from 'next-auth';
import { authOptions } from '../../../../lib/auth-config.js';

// Handler optimizado para App Router
const handler = NextAuth(authOptions);

// Exportar todos los métodos HTTP necesarios para NextAuth
export { handler as GET, handler as POST };
