const bcrypt = require("bcryptjs");
const { query, transaction } = require("./postgres.cjs");

const userDb = {
  // Crear usuario
  async createUser(userData) {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new Error("El email ya está registrado");
      }

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(userData.password, 12);

      // Insertar usuario en PostgreSQL
      const result = await query(
        `INSERT INTO users (email, name, password_hash, email_verified, email_verification_token)
         VALUES ($1, $2, $3, $4, uuid_generate_v4())
         RETURNING id, email, name, email_verified, email_verification_token, created_at, updated_at`,
        [
          userData.email.toLowerCase().trim(),
          userData.name.trim(),
          passwordHash,
          false,
        ]
      );

      const newUser = result.rows[0];

      // Retornar usuario sin password
      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        emailVerified: newUser.email_verified,
        emailVerificationToken: newUser.email_verification_token,
        createdAt: newUser.created_at,
        updatedAt: newUser.updated_at,
      };
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    }
  },

  // Buscar usuario por email
  async findByEmail(email) {
    try {
      const result = await query("SELECT * FROM users WHERE email = $1", [
        email.toLowerCase().trim(),
      ]);

      if (result.rows.length === 0) return null;

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password_hash,
        emailVerified: user.email_verified,
        emailVerificationToken: user.email_verification_token,
        passwordResetToken: user.password_reset_token,
        passwordResetExpires: user.password_reset_expires,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      console.error("Find user by email error:", error);
      return null;
    }
  },

  // Buscar usuario por ID
  async findById(id) {
    try {
      const result = await query("SELECT * FROM users WHERE id = $1", [id]);

      if (result.rows.length === 0) return null;

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      console.error("Find user by ID error:", error);
      return null;
    }
  },

  // Verificar contraseña
  async verifyPassword(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) return null;

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return null;

      // Retornar usuario sin password
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("Verify password error:", error);
      return null;
    }
  },

  // Verificar email
  async verifyEmail(token) {
    try {
      console.log("🔍 verifyEmail: Attempting to verify token:", {
        tokenLength: token?.length,
        token: token?.substring(0, 8) + "...",
      });

      // First, let's check if a user exists with this token
      const checkResult = await query(
        "SELECT id, email, name, email_verified FROM users WHERE email_verification_token = $1",
        [token]
      );

      console.log("📊 Token check result:", {
        userFound: checkResult.rows.length > 0,
        alreadyVerified: checkResult.rows[0]?.email_verified,
        userEmail: checkResult.rows[0]?.email,
      });

      if (checkResult.rows.length === 0) {
        console.log("❌ No user found with this verification token");
        return null;
      }

      if (checkResult.rows[0].email_verified) {
        console.log("✅ User already verified, returning user data");
        return {
          id: checkResult.rows[0].id,
          email: checkResult.rows[0].email,
          name: checkResult.rows[0].name,
          emailVerified: true,
          createdAt: checkResult.rows[0].created_at,
          updatedAt: checkResult.rows[0].updated_at,
        };
      }

      // Now update the user
      const result = await query(
        `UPDATE users 
         SET email_verified = true, email_verification_token = null, updated_at = NOW()
         WHERE email_verification_token = $1 
         RETURNING id, email, name, email_verified, created_at, updated_at`,
        [token]
      );

      console.log("🔄 Update result:", { rowsAffected: result.rows.length });

      if (result.rows.length === 0) return null;

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      console.error("Verify email error:", error);

      // En caso de timeout, verificar si el usuario se verificó correctamente
      if (
        error.message?.includes("timeout") ||
        error.message?.includes("Connection terminated")
      ) {
        try {
          console.log(
            "Timeout detected, checking if email was actually verified..."
          );
          // Verificar si el usuario con este token fue verificado
          const checkResult = await query(
            "SELECT id, email, name, email_verified, created_at, updated_at FROM users WHERE email_verification_token IS NULL AND email_verified = true AND updated_at > NOW() - INTERVAL '1 minute'"
          );

          if (checkResult.rows.length > 0) {
            console.log("Email verification was successful despite timeout");
            const user = checkResult.rows[0];
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              emailVerified: user.email_verified,
              createdAt: user.created_at,
              updatedAt: user.updated_at,
            };
          }
        } catch (checkError) {
          console.error(
            "Error checking verification status:",
            checkError.message
          );
        }
      }

      return null;
    }
  },

  // Generar token de reseteo de contraseña
  async generatePasswordResetToken(email) {
    try {
      // Token expira en 1 hora
      const expiresAt = new Date(Date.now() + 3600000);

      const result = await query(
        `UPDATE users 
         SET password_reset_token = uuid_generate_v4(), 
             password_reset_expires = $2, 
             updated_at = NOW()
         WHERE email = $1 
         RETURNING password_reset_token`,
        [email.toLowerCase().trim(), expiresAt]
      );

      if (result.rows.length === 0) return null;

      return result.rows[0].password_reset_token;
    } catch (error) {
      console.error("Generate password reset token error:", error);
      return null;
    }
  },

  // Resetear contraseña
  async resetPassword(token, newPassword) {
    try {
      return await transaction(async (client) => {
        // Verificar token válido y no expirado
        const userResult = await client.query(
          `SELECT id, email, name FROM users 
           WHERE password_reset_token = $1 
           AND password_reset_expires > NOW()`,
          [token]
        );

        if (userResult.rows.length === 0) return null;

        // Hash nueva contraseña
        const passwordHash = await bcrypt.hash(newPassword, 12);

        // Actualizar contraseña y limpiar tokens
        const updateResult = await client.query(
          `UPDATE users 
           SET password_hash = $2, 
               password_reset_token = null, 
               password_reset_expires = null, 
               updated_at = NOW()
           WHERE id = $1 
           RETURNING id, email, name, email_verified, updated_at`,
          [userResult.rows[0].id, passwordHash]
        );

        const user = updateResult.rows[0];
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.email_verified,
          updatedAt: user.updated_at,
        };
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return null;
    }
  },

  // Funciones de mantenimiento
  async cleanupExpiredTokens() {
    try {
      await query("SELECT cleanup_expired_tokens()");
      return { success: true, message: "Expired tokens cleaned up" };
    } catch (error) {
      console.error("Cleanup expired tokens error:", error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar perfil de usuario
  async updateProfile(userId, profileData) {
    try {
      const { name, email } = profileData;

      // Obtener el usuario actual para comparar el email
      const currentUser = await query(
        "SELECT email, name FROM users WHERE id = $1",
        [userId]
      );

      if (currentUser.rows.length === 0) {
        throw new Error("Usuario no encontrado");
      }

      const currentUserData = currentUser.rows[0];
      let emailChanged = false;

      // Verificar si el email realmente cambió
      if (email !== undefined) {
        const newEmail = email.toLowerCase().trim();
        const currentEmail = currentUserData.email.toLowerCase().trim();
        emailChanged = newEmail !== currentEmail;

        // Solo verificar duplicados si el email realmente cambió
        if (emailChanged) {
          const existingUser = await query(
            "SELECT id FROM users WHERE email = $1 AND id != $2",
            [newEmail, userId]
          );

          if (existingUser.rows.length > 0) {
            throw new Error("El email ya está en uso por otro usuario");
          }
        }
      }

      // Construir query dinámico según los campos a actualizar
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount}`);
        values.push(name.trim());
        paramCount++;
      }

      if (email !== undefined) {
        updates.push(`email = $${paramCount}`);
        values.push(email.toLowerCase().trim());
        paramCount++;

        // Solo requerir verificación si el email realmente cambió
        if (emailChanged) {
          updates.push(`email_verified = false`);
          updates.push(`email_verification_token = uuid_generate_v4()`);
        }
      }

      updates.push(`updated_at = NOW()`);
      values.push(userId);

      const updateQuery = `
        UPDATE users 
        SET ${updates.join(", ")}
        WHERE id = $${paramCount}
        RETURNING id, email, name, email_verified, email_verification_token, updated_at
      `;

      console.log("🔄 Profile update:", {
        userId,
        nameChanged: name !== undefined,
        emailProvided: email !== undefined,
        emailChanged,
        updatesCount: updates.length - 1, // -1 porque updated_at siempre se incluye
      });

      const result = await query(updateQuery, values);

      if (result.rows.length === 0) {
        throw new Error("Usuario no encontrado");
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.email_verified,
        emailVerificationToken: user.email_verification_token,
        updatedAt: user.updated_at,
        emailChanged: emailChanged,
      };
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },

  // Cambiar contraseña
  async updatePassword(userId, currentPassword, newPassword) {
    try {
      return await transaction(async (client) => {
        // Verificar contraseña actual
        const userResult = await client.query(
          "SELECT password_hash FROM users WHERE id = $1",
          [userId]
        );

        if (userResult.rows.length === 0) {
          throw new Error("Usuario no encontrado");
        }

        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          userResult.rows[0].password_hash
        );

        if (!isCurrentPasswordValid) {
          throw new Error("La contraseña actual es incorrecta");
        }

        // Hash nueva contraseña
        const newPasswordHash = await bcrypt.hash(newPassword, 12);

        // Actualizar contraseña
        const updateResult = await client.query(
          `UPDATE users 
           SET password_hash = $2, updated_at = NOW()
           WHERE id = $1 
           RETURNING id, email, name, updated_at`,
          [userId, newPasswordHash]
        );

        const user = updateResult.rows[0];
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          updatedAt: user.updated_at,
        };
      });
    } catch (error) {
      console.error("Update password error:", error);
      throw error;
    }
  },

  // Generar nuevo token de verificación de email
  async generateEmailVerificationToken(userId) {
    try {
      const result = await query(
        `UPDATE users 
         SET email_verification_token = uuid_generate_v4(), updated_at = NOW()
         WHERE id = $1 AND email_verified = false
         RETURNING id, email, name, email_verification_token, updated_at`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null; // Usuario no encontrado o ya verificado
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerificationToken: user.email_verification_token,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      console.error("Generate email verification token error:", error);
      return null;
    }
  },

  // Estadísticas de usuarios (útil para admin)
  async getUserStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE email_verified = true) as verified_users,
          COUNT(*) FILTER (WHERE email_verified = false) as unverified_users,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as new_users_today,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_users_week
        FROM users
      `);

      return result.rows[0];
    } catch (error) {
      console.error("Get user stats error:", error);
      return null;
    }
  },
};

module.exports = { userDb };
