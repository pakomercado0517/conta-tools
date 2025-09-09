import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const { userDb } = require('../../../../lib/userDbPostgres.cjs');

export const authOptions = {
  // Por ahora usamos JWT, después migraremos a database sessions
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
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

          // Verificar que el email esté verificado
          if (!user.emailVerified) {
            throw new Error('EMAIL_NOT_VERIFIED');
          }

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
      if (session?.user) {
        // Con strategy: 'database', usar user de la BD
        if (user) {
          session.user.id = user.id;
          session.user.emailVerified = user.emailVerified;
        } else if (token) {
          // Fallback al JWT si no hay user
          session.user.id = token.id;
          session.user.emailVerified = token.emailVerified;
        }
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      // Control adicional en el login
      if (!user?.emailVerified && account?.provider === 'credentials') {
        // Ya se maneja en authorize, pero doble verificación
        return false;
      }
      return true;
    }
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  
  // Configuración de cookies
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
