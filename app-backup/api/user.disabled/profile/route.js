import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { authOptions } from "../../../../lib/auth-config.js";

// Indicate that this route uses dynamic features
export const dynamic = "force-dynamic";

const { userDb } = require("../../../../lib/userDbPostgres.cjs");
import { emailService } from "../../../../lib/emailService.js";

export async function GET(request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    // Obtener perfil del usuario
    try {
      const user = await userDb.findById(userId);

      if (!user) {
        return NextResponse.json(
          { message: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return NextResponse.json(
        { message: "Error interno del servidor" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, email } = body;

    // Validación básica
    if (!name && !email) {
      return NextResponse.json(
        { message: "Se requiere al menos un campo para actualizar" },
        { status: 400 }
      );
    }

    if (name && name.trim().length < 2) {
      return NextResponse.json(
        { message: "El nombre debe tener al menos 2 caracteres" },
        { status: 400 }
      );
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { message: "El formato del email no es válido" },
          { status: 400 }
        );
      }
    }

    // Actualizar perfil
    try {
      const updatedUser = await userDb.updateProfile(userId, { name, email });

      // Si se cambió el email, enviar email de verificación
      if (updatedUser.emailChanged && updatedUser.emailVerificationToken) {
        try {
          const emailResult = await emailService.sendVerificationEmail(
            updatedUser.email,
            updatedUser.name,
            updatedUser.emailVerificationToken
          );

          if (!emailResult.success) {
            console.error(
              "Failed to send verification email:",
              emailResult.error
            );
          }
        } catch (emailError) {
          console.error("Email service error:", emailError);
          // No fallar la actualización si el email no se puede enviar
        }
      }

      const response = NextResponse.json({
        message: updatedUser.emailChanged
          ? "Perfil actualizado. Se ha enviado un email de verificación a tu nueva dirección. Tu sesión se cerrará para proteger tu cuenta."
          : "Perfil actualizado exitosamente",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          emailVerified: updatedUser.emailVerified,
          updatedAt: updatedUser.updatedAt,
        },
        emailChanged: updatedUser.emailChanged,
        // Indicar al frontend que debe cerrar la sesión
        shouldSignOut: updatedUser.emailChanged,
      });

      // Revalidar las rutas que dependen de los datos del perfil
      revalidatePath("/profile/edit");
      revalidatePath("/dashboard");
      revalidatePath("/api/user/profile");

      // Si se cambió el email, cerrar la sesión del usuario
      if (updatedUser.emailChanged) {
        console.log("📧 Email changed, invalidating session for user:", userId);
        // Agregar headers para invalidar la sesión
        response.headers.set("X-Session-Invalidate", "true");
        // Revalidar rutas adicionales por el cambio de email
        revalidatePath("/");
      }

      return response;
    } catch (error) {
      console.error("Update profile error:", error);

      if (error.message.includes("ya está en uso")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }

      return NextResponse.json(
        { message: "Error interno del servidor" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
