import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const { userDb } = require('../../../../lib/userDbPostgres.cjs');
const { emailService } = require('../../../../lib/emailService');

export async function POST(request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validación básica
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: 'La nueva contraseña y la confirmación no coinciden' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'La nueva contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { message: 'La nueva contraseña debe ser diferente a la actual' },
        { status: 400 }
      );
    }

    try {
      // Cambiar contraseña
      const updatedUser = await userDb.updatePassword(userId, currentPassword, newPassword);

      // Obtener información completa del usuario para el email
      const userInfo = await userDb.findById(userId);

      // Enviar email de confirmación
      if (userInfo && userInfo.emailVerified) {
        try {
          const emailResult = await emailService.sendPasswordChangedEmail(
            userInfo.email,
            userInfo.name
          );

          if (!emailResult.success) {
            console.error('Failed to send password changed email:', emailResult.error);
          }
        } catch (emailError) {
          console.error('Email service error:', emailError);
          // No fallar el cambio de contraseña si el email no se puede enviar
        }
      }

      return NextResponse.json({
        message: 'Contraseña cambiada exitosamente',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          updatedAt: updatedUser.updatedAt
        }
      });

    } catch (error) {
      console.error('Change password error:', error);
      
      if (error.message.includes('contraseña actual es incorrecta')) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
      
      if (error.message.includes('Usuario no encontrado')) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }

      return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }

  } catch (error) {
    console.error('Change password API error:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
