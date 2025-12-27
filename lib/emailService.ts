import nodemailer, { Transporter, SendMailOptions } from "nodemailer";

// Tipos para la configuración del transporter
interface EmailConfig {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
  tls: {
    rejectUnauthorized: boolean;
  };
}

// Tipos para las respuestas del servicio
interface EmailResult {
  success: boolean;
  error?: string;
}

// Tipos para los parámetros de los emails
interface VerificationEmailParams {
  email: string;
  name: string;
  verificationToken: string;
}

interface PasswordResetEmailParams {
  email: string;
  name: string;
  resetToken: string;
}

interface SimpleEmailParams {
  email: string;
  name: string;
}

// Validar variables de entorno
const emailUser = process.env.EMAIL_SERVER_USER;
const emailPassword = process.env.EMAIL_SERVER_PASSWORD;

if (!emailUser || !emailPassword) {
  throw new Error(
    "Email configuration is missing. Please check EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD environment variables."
  );
}

// Configuración del transporter con tipos
const emailConfig: EmailConfig = {
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
  tls: {
    rejectUnauthorized: false,
  },
};

const transporter: Transporter = nodemailer.createTransport(emailConfig);

/**
 * Genera el template base con estilos de Conta Tools
 * @param content - Contenido HTML del email
 * @param title - Título del email
 * @returns HTML completo del email
 */
const getEmailTemplate = (content: string, title: string): string => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f3f4f6;
            color: #374151;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 1.875rem;
            font-weight: bold;
        }
        .header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 2rem;
        }
        .content h2 {
            color: #1f2937;
            margin-bottom: 1rem;
        }
        .content p {
            line-height: 1.6;
            margin-bottom: 1rem;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white !important;
            text-decoration: none;
            padding: 0.75rem 2rem;
            border-radius: 6px;
            font-weight: 600;
            margin: 1rem 0;
            transition: all 0.2s;
        }
        .button:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            transform: translateY(-1px);
        }
        .code-box {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 1rem;
            font-family: 'Courier New', monospace;
            font-size: 1.25rem;
            font-weight: bold;
            color: #1f2937;
            text-align: center;
            margin: 1rem 0;
        }
        .footer {
            background-color: #f9fafb;
            padding: 1.5rem;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 0;
            font-size: 0.875rem;
            color: #6b7280;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 1.5rem 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Conta Tools</h1>
            <p>Herramientas contables profesionales</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>Este correo fue enviado desde <a href="${process.env.APP_URL || "#"}">Conta Tools</a></p>
            <p>Si no solicitaste esta acción, puedes ignorar este correo de forma segura.</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Función helper para enviar emails con manejo de errores
 * @param mailOptions - Opciones del email a enviar
 * @returns Resultado de la operación
 */
const sendEmail = async (
  mailOptions: SendMailOptions
): Promise<EmailResult> => {
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("Error sending email:", error);
    return { success: false, error: errorMessage };
  }
};

/**
 * Servicio de emails con funciones tipadas
 */
export const emailService = {
  /**
   * Envía email de verificación de cuenta
   * @param params - Parámetros para el email de verificación
   * @returns Resultado de la operación
   */
  async sendVerificationEmail(
    params: VerificationEmailParams
  ): Promise<EmailResult> {
    const { email, name, verificationToken } = params;
    const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${verificationToken}`;

    const content = `
      <h2>¡Bienvenido a Conta Tools, ${name}!</h2>
      <p>Gracias por registrarte en nuestra plataforma. Para completar tu registro y acceder a todas las funcionalidades, necesitas verificar tu dirección de correo electrónico.</p>
      
      <div style="text-align: center; margin: 2rem 0;">
        <a href="${verificationUrl}" class="button">Verificar mi cuenta</a>
      </div>
      
      <div class="divider"></div>
      
      <p><strong>¿No puedes hacer clic en el botón?</strong></p>
      <p>Copia y pega el siguiente enlace en tu navegador:</p>
      <p style="word-break: break-all; color: #3b82f6;">${verificationUrl}</p>
      
      <p><strong>Nota importante:</strong> Este enlace expirará en 24 horas por motivos de seguridad.</p>
    `;

    const mailOptions: SendMailOptions = {
      from: `"${process.env.APP_NAME || "Conta Tools"}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Verifica tu cuenta - ${process.env.APP_NAME || "Conta Tools"}`,
      html: getEmailTemplate(content, "Verificación de cuenta"),
    };

    return sendEmail(mailOptions);
  },

  /**
   * Envía email de recuperación de contraseña
   * @param params - Parámetros para el email de recuperación
   * @returns Resultado de la operación
   */
  async sendPasswordResetEmail(
    params: PasswordResetEmailParams
  ): Promise<EmailResult> {
    const { email, name, resetToken } = params;
    const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${resetToken}`;

    const content = `
      <h2>Recuperación de contraseña</h2>
      <p>Hola ${name},</p>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Conta Tools. Si no fuiste tú quien realizó esta solicitud, puedes ignorar este correo de forma segura.</p>
      
      <div style="text-align: center; margin: 2rem 0;">
        <a href="${resetUrl}" class="button">Restablecer contraseña</a>
      </div>
      
      <div class="divider"></div>
      
      <p><strong>¿No puedes hacer clic en el botón?</strong></p>
      <p>Copia y pega el siguiente enlace en tu navegador:</p>
      <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
      
      <p><strong>Importante:</strong></p>
      <ul>
        <li>Este enlace expirará en 1 hora por motivos de seguridad</li>
        <li>Solo puedes usar este enlace una vez</li>
        <li>Si no solicitaste este cambio, tu cuenta permanece segura</li>
      </ul>
    `;

    const mailOptions: SendMailOptions = {
      from: `"${process.env.APP_NAME || "Conta Tools"}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Recuperar contraseña - ${process.env.APP_NAME || "Conta Tools"}`,
      html: getEmailTemplate(content, "Recuperación de contraseña"),
    };

    return sendEmail(mailOptions);
  },

  /**
   * Envía email de confirmación de cambio de contraseña
   * @param params - Parámetros para el email de confirmación
   * @returns Resultado de la operación
   */
  async sendPasswordChangedEmail(
    params: SimpleEmailParams
  ): Promise<EmailResult> {
    const { email, name } = params;

    const content = `
      <h2>Contraseña cambiada exitosamente</h2>
      <p>Hola ${name},</p>
      <p>Te confirmamos que la contraseña de tu cuenta en Conta Tools ha sido cambiada exitosamente.</p>
      
      <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 1rem; margin: 1rem 0;">
        <p style="margin: 0; color: #0c4a6e;"><strong>✅ Cambio realizado:</strong> ${new Date().toLocaleString("es-ES", { timeZone: "America/Mexico_City" })}</p>
      </div>
      
      <p><strong>¿No fuiste tú quien realizó este cambio?</strong></p>
      <p>Si no autorizaste este cambio, por favor contacta inmediatamente a nuestro soporte técnico:</p>
      
      <div style="text-align: center; margin: 2rem 0;">
        <a href="mailto:soporte@contatools.com" class="button">Contactar Soporte</a>
      </div>
      
      <p><strong>Recomendaciones de seguridad:</strong></p>
      <ul>
        <li>Usa contraseñas únicas para cada cuenta</li>
        <li>Habilita la autenticación de dos factores cuando esté disponible</li>
        <li>No compartas tus credenciales con nadie</li>
      </ul>
    `;

    const mailOptions: SendMailOptions = {
      from: `"${process.env.APP_NAME || "Conta Tools"}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Contraseña actualizada - ${process.env.APP_NAME || "Conta Tools"}`,
      html: getEmailTemplate(content, "Contraseña actualizada"),
    };

    return sendEmail(mailOptions);
  },

  /**
   * Envía email de bienvenida después de verificar cuenta
   * @param params - Parámetros para el email de bienvenida
   * @returns Resultado de la operación
   */
  async sendWelcomeEmail(params: SimpleEmailParams): Promise<EmailResult> {
    const { email, name } = params;
    const dashboardUrl = `${process.env.APP_URL}/dashboard`;

    const content = `
      <h2>¡Tu cuenta ha sido verificada exitosamente!</h2>
      <p>¡Hola ${name}!</p>
      <p>¡Excelente! Ya puedes acceder a todas las funcionalidades de Conta Tools. Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
      
      <div style="text-align: center; margin: 2rem 0;">
        <a href="${dashboardUrl}" class="button">Acceder a mi cuenta</a>
      </div>
      
      <div class="divider"></div>
      
      <h3>¿Qué puedes hacer ahora?</h3>
      <ul>
        <li><strong>Generar contratos:</strong> Crea contratos de compraventa profesionales</li>
        <li><strong>Gestionar facturas:</strong> Organiza y administra tus facturas</li>
        <li><strong>Herramientas contables:</strong> Accede a calculadoras y utilidades</li>
        <li><strong>Personalizar perfil:</strong> Configura tu información personal</li>
      </ul>
      
      <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. ¡Estamos aquí para ayudarte!</p>
    `;

    const mailOptions: SendMailOptions = {
      from: `"${process.env.APP_NAME || "Conta Tools"}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `¡Bienvenido a ${process.env.APP_NAME || "Conta Tools"}!`,
      html: getEmailTemplate(content, "Cuenta verificada"),
    };

    return sendEmail(mailOptions);
  },
};

/**
 * Función para verificar la configuración del servicio de email
 * @returns true si la configuración es válida
 */
export const verifyEmailConfig = (): boolean => {
  const requiredEnvVars = [
    "EMAIL_SERVER_USER",
    "EMAIL_SERVER_PASSWORD",
    "EMAIL_FROM",
    "APP_URL",
    "APP_NAME",
  ];

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    console.error(
      "Missing email configuration environment variables:",
      missing
    );
    return false;
  }

  return true;
};

export default emailService;
