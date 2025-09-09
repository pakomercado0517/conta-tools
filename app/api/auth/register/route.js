import { NextResponse } from 'next/server';
import { emailService } from '../../../../lib/emailService.js';
const { userDb } = require('../../../../lib/userDbPostgres.cjs');

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validación básica
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Crear usuario en la base de datos
    const newUser = await userDb.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    // Enviar email de verificación
    const emailResult = await emailService.sendVerificationEmail(
      newUser.email,
      newUser.name,
      newUser.emailVerificationToken
    );

    if (!emailResult.success) {
      console.error('Error enviando email de verificación:', emailResult.error);
      // No fallar la creación del usuario por el email, pero logeamos el error
    }

    return NextResponse.json({
      message: 'Usuario creado exitosamente. Por favor verifica tu email para activar tu cuenta.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        emailVerified: newUser.emailVerified
      },
      emailSent: emailResult.success
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);

    // Manejar errores específicos
    if (error.message === 'El email ya está registrado') {
      return NextResponse.json(
        { message: 'Ya existe una cuenta con este email' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Error interno del servidor al crear la cuenta' },
      { status: 500 }
    );
  }
}
