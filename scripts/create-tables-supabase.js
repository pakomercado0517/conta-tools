import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config({ path: ".env.local" });

// Crear cliente Supabase usando las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTablesWithSupabase() {
  console.log("🏗️  Creando tablas en Supabase usando cliente JS...");
  console.log("🔗 URL:", supabaseUrl);

  try {
    // SQL para crear todas las tablas
    const createTableSQL = `
      -- 1. Habilitar extensiones necesarias
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      -- 2. Crear tabla de usuarios
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

      -- 3. Crear índices para optimización
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
      CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
      CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
      CREATE INDEX IF NOT EXISTS idx_users_password_reset_expires ON users(password_reset_expires);

      -- 4. Crear función para limpiar tokens expirados
      CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
      RETURNS void AS $$
      BEGIN
        -- Limpiar tokens de reset de contraseña expirados
        UPDATE users 
        SET password_reset_token = null, password_reset_expires = null
        WHERE password_reset_expires < NOW();
        
        RAISE NOTICE 'Cleaned up expired password reset tokens';
      END;
      $$ LANGUAGE plpgsql;

      -- 5. Crear tablas para NextAuth
      
      -- Tabla accounts (para OAuth providers si se usan en futuro)
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

      -- Tabla sessions (para strategy: 'database')
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tabla verification_tokens (NextAuth puede usar esta tabla)
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (identifier, token)
      );

      -- 6. Crear índices para NextAuth
      CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires ON verification_tokens(expires);

      -- 7. Crear función trigger para updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Aplicar trigger a las tablas
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
    `;

    // Ejecutar SQL usando RPC
    console.log("📦 Ejecutando SQL...");
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: createTableSQL,
    });

    if (error) {
      console.error("❌ Error ejecutando SQL:", error);

      // Intentar método alternativo: ejecutar sentencias individualmente
      console.log("🔄 Intentando método alternativo...");
      await createTablesAlternative();
    } else {
      console.log("✅ SQL ejecutado exitosamente");
      await verifyTables();
    }
  } catch (error) {
    console.error("❌ Error general:", error.message);

    // Intentar método alternativo
    console.log("🔄 Intentando método alternativo...");
    await createTablesAlternative();
  }
}

async function createTablesAlternative() {
  console.log("📝 Creando tablas una por una...");

  // Intentar crear tablas usando el dashboard de Supabase o SQL directo
  console.log(`
  ⚠️  El método automático falló. Por favor:
  
  1. Ve al Dashboard de Supabase: ${supabaseUrl}
  2. Ve a "SQL Editor"
  3. Ejecuta el siguiente SQL:

  -- Crear tabla users
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

  -- Crear tabla sessions para NextAuth
  CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Crear tabla accounts para NextAuth
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

  -- Crear tabla verification_tokens para NextAuth
  CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (identifier, token)
  );

  4. Una vez ejecutado, ejecuta: node scripts/verify-tables.js
  `);
}

async function verifyTables() {
  console.log("✅ Verificando tablas...");

  // Verificar que exista la tabla users
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*")
    .limit(1);

  if (!usersError) {
    console.log("✅ Tabla users: OK");
  } else {
    console.log("❌ Tabla users:", usersError.message);
  }

  // Verificar sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("*")
    .limit(1);

  if (!sessionsError) {
    console.log("✅ Tabla sessions: OK");
  } else {
    console.log("❌ Tabla sessions:", sessionsError.message);
  }

  console.log("🎉 Verificación completada");
}

createTablesWithSupabase();
