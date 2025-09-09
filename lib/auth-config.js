// Configuración minimalista para evitar errores de build
export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [],
  trustHost: true,
  debug: false,
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  }
};
