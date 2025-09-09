import CredentialsProvider from 'next-auth/providers/credentials';

const { userDb } = require('./userDbPostgres.cjs');

export const authOptions = {
  // Usar JWT para production (más compatible con serverless)
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60, // Actualizar cada 24 horas
  },
  
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Verificar credenciales
          const user = await userDb.verifyPassword(credentials.email, credentials.password);
          
          if (!user) {
            return null;
          }

          // Permitir login incluso sin verificación de email
          // El middleware manejará las restricciones por ruta

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Ejecuta cuando se crea el JWT (login)
      if (user) {
        token.id = user.id;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },

    async session({ session, user, token }) {
      // Ejecuta en cada request cuando hay sesión
      if (session?.user && token) {
        // Con strategy: 'jwt', usar token
        session.user.id = token.id;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      // Permitir login siempre que las credenciales sean válidas
      // El middleware controlará las restricciones por ruta
      return true;
    },
    
    async redirect({ url, baseUrl }) {
      // Redirecciones personalizadas para manejar diferentes entornos
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + '/dashboard';
    }
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  
  // Usar configuración de cookies por defecto de NextAuth
  // Las cookies personalizadas pueden causar problemas en Vercel
  
  // Configuración específica para Vercel
  trustHost: true
};
