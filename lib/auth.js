import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PostgresAdapter } from '@auth/pg-adapter';
import { Pool } from 'pg';
import { userDb } from './userDbPostgres.js';

// Pool de conexiones para NextAuth (separado del principal para evitar conflictos)
const authPool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Máximo 10 conexiones para auth
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const authOptions = {
  // Usar adaptador PostgreSQL para sesiones y cuentas
  adapter: PostgresAdapter(authPool),
  
  // Estrategia de sesión en base de datos (más seguro)
  session: {
    strategy: 'database',
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        try {
          // Verificar credenciales con nuestra lógica personalizada
          const user = await userDb.verifyPassword(credentials.email, credentials.password);
          
          if (!user) {
            throw new Error('Credenciales inválidas');
          }

          // Verificar que el email esté verificado
          if (!user.emailVerified) {
            throw new Error('Debes verificar tu email antes de iniciar sesión');
          }

          // Retornar objeto compatible con NextAuth
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified ? new Date() : null,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ],

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

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
          // Fallback al JWT si no hay user (no debería pasar con 'database')
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
    },

    async redirect({ url, baseUrl }) {
      // Redirecciones personalizadas
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + '/dashboard';
    }
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email}`);
    },
    async signOut({ token, session }) {
      console.log(`User signed out: ${session?.user?.email || token?.email}`);
    },
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`);
    },
    async linkAccount({ user, account, profile }) {
      console.log(`Account linked: ${account.provider} for ${user.email}`);
    }
  },

  // Configuración de seguridad
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

export default authOptions;
