import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config.js";

const { userDb } = require("../../../../lib/userDbPostgres.cjs");
import { emailService } from "../../../../lib/emailService.js";

export async function POST(request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
      // Verificar si el email ya está verificado
      const user = await userDb.findById(userId);

      if (!user) {
        return NextResponse.json(
          { message: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      if (user.emailVerified) {
        return NextResponse.json(
          {
            message: "Tu email ya está verificado",
          },
          { status: 400 }
        );
      }

      // Generar un nuevo token de verificación y actualizar la base de datos
      const result = await userDb.generateEmailVerificationToken(userId);

      if (!result) {
        return NextResponse.json(
          {
            message: "Error generando el token de verificación",
          },
          { status: 500 }
        );
      }

      // Enviar email de verificación
      try {
        const emailResult = await emailService.sendVerificationEmail(
          user.email,
          user.name,
          result.emailVerificationToken
        );

        if (emailResult.success) {
          return NextResponse.json({
            message:
              "Email de verificación enviado exitosamente. Revisa tu bandeja de entrada.",
            success: true,
          });
        } else {
          console.error("Error sending verification email:", emailResult.error);
          return NextResponse.json(
            {
              message:
                "Error enviando el email de verificación. Inténtalo de nuevo más tarde.",
            },
            { status: 500 }
          );
        }
      } catch (emailError) {
        console.error("Email service error:", emailError);
        return NextResponse.json(
          {
            message:
              "Error enviando el email de verificación. Inténtalo de nuevo más tarde.",
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      return NextResponse.json(
        {
          message: "Error interno del servidor",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Resend verification API error:", error);
    return NextResponse.json(
      {
        message: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
