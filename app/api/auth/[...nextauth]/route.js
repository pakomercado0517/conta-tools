import NextAuth from 'next-auth';

// Configuración simple y robusta inline
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [],
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
