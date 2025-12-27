import { query } from "../lib/postgres.js";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config({ path: ".env.local" });

async function createTables() {
  console.log("🏗️  Creando tablas en Supabase...");

  try {
    // 1. Habilitar extensiones necesarias
    console.log("📦 Habilitando extensiones...");
    await query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `);

    // 2. Crear tabla de usuarios
    console.log("👥 Creando tabla users...");
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        password_hash TEXT NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        email_verification_token UUID DEFAULT uuid_generate_v4(),
        password_reset_token UUID,
        password_reset_expires TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 3. Crear índices para optimización
    console.log("🔍 Creando índices...");
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
      CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
      CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
      CREATE INDEX IF NOT EXISTS idx_users_password_reset_expires ON users(password_reset_expires);
    `);

    // 4. Crear función para limpiar tokens expirados
    console.log("🧹 Creando función de limpieza...");
    await query(`
      CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
      RETURNS void AS $$
      BEGIN
        -- Limpiar tokens de reset de contraseña expirados
        UPDATE users 
        SET password_reset_token = null, password_reset_expires = null
        WHERE password_reset_expires < NOW();
        
        -- Log de limpieza
        RAISE NOTICE 'Cleaned up expired password reset tokens';
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 5. Crear tablas para NextAuth
    console.log("🔐 Creando tablas NextAuth...");

    // Tabla accounts (para OAuth providers si se usan en futuro)
    await query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        provider_account_id VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at BIGINT,
        id_token TEXT,
        scope TEXT,
        session_state TEXT,
        token_type TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(provider, provider_account_id)
      );
    `);

    // Tabla sessions (para strategy: 'database')
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Tabla verification_tokens (NextAuth puede usar esta tabla)
    await query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (identifier, token)
      );
    `);

    // 6. Crear índices para NextAuth
    console.log("📊 Creando índices NextAuth...");
    await query(`
      CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires ON verification_tokens(expires);
    `);

    // 7. Crear función trigger para updated_at
    console.log("⏰ Creando triggers para updated_at...");
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Aplicar trigger a las tablas
    await query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
      CREATE TRIGGER update_accounts_updated_at
        BEFORE UPDATE ON accounts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
      CREATE TRIGGER update_sessions_updated_at
        BEFORE UPDATE ON sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // 8. Verificar que todas las tablas se crearon correctamente
    console.log("✅ Verificando tablas creadas...");
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'accounts', 'sessions', 'verification_tokens')
      ORDER BY table_name;
    `);

    const tables = result.rows.map((row) => row.table_name);
    console.log("📋 Tablas creadas:", tables);

    if (tables.length === 4) {
      console.log("🎉 ¡Todas las tablas se crearon exitosamente!");

      // Mostrar estadísticas
      const stats = await query(`
        SELECT 
          'users' as table_name, COUNT(*) as count FROM users
        UNION ALL
        SELECT 'accounts' as table_name, COUNT(*) as count FROM accounts
        UNION ALL
        SELECT 'sessions' as table_name, COUNT(*) as count FROM sessions
        UNION ALL
        SELECT 'verification_tokens' as table_name, COUNT(*) as count FROM verification_tokens;
      `);

      console.log("📊 Estado inicial de las tablas:");
      stats.rows.forEach((row) => {
        console.log(`   ${row.table_name}: ${row.count} registros`);
      });
    } else {
      console.log("⚠️  Algunas tablas no se crearon correctamente");
    }
  } catch (error) {
    console.error("❌ Error creando tablas:", error.message);
    process.exit(1);
  }
}

createTables();
