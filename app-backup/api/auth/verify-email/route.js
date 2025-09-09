import { NextResponse } from 'next/server';
const { userDb } = require('../../../../lib/userDbPostgres.cjs');

// Handle GET requests (from email links)
export async function GET(request) {
  try {
    // Verificar que request.url esté disponible
    if (!request.url) {
      return NextResponse.json(
        { message: 'URL de la petición inválida' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    console.log('🔍 Email verification GET attempt:', { tokenProvided: !!token, tokenLength: token?.length });

    if (!token) {
      return NextResponse.json(
        { message: 'Token de verificación requerido' },
        { status: 400 }
      );
    }

    // Verificar el email usando el token
    const user = await userDb.verifyEmail(token);
    console.log('📧 GET Verification result:', { userFound: !!user, userEmail: user?.email });

    if (user) {
      return NextResponse.json({
        message: '¡Email verificado exitosamente! Ya puedes acceder a todas las funcionalidades.',
        verified: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified
        }
      });
    } else {
      return NextResponse.json(
        { 
          message: 'Token inválido, expirado o ya fue utilizado',
          verified: false 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verificando email (GET):', error);
    return NextResponse.json(
      { 
        message: 'Error interno del servidor al verificar el email',
        verified: false 
      },
      { status: 500 }
    );
  }
}

// Handle POST requests (from frontend forms)
export async function POST(request) {
  try {
    const { token } = await request.json();

    console.log('🔍 Email verification attempt:', { tokenProvided: !!token, tokenLength: token?.length });

    if (!token) {
      return NextResponse.json(
        { message: 'Token de verificación requerido' },
        { status: 400 }
      );
    }

    // Verificar el email usando el token
    const user = await userDb.verifyEmail(token);
    console.log('📧 Verification result:', { userFound: !!user, userEmail: user?.email });

    if (user) {
      return NextResponse.json({
        message: '¡Email verificado exitosamente! Ya puedes acceder a todas las funcionalidades.',
        verified: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified
        }
      });
    } else {
      return NextResponse.json(
        { 
          message: 'Token inválido, expirado o ya fue utilizado',
          verified: false 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verificando email:', error);
    return NextResponse.json(
      { 
        message: 'Error interno del servidor al verificar el email',
        verified: false 
      },
      { status: 500 }
    );
  }
}
