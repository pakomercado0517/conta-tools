-- ===============================================
-- Schema para Conta Tools - PostgreSQL
-- ===============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios principal
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token UUID DEFAULT uuid_generate_v4(),
    password_reset_token UUID,
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones para NextAuth (opcional, NextAuth puede usar JWT)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cuentas OAuth (para proveedores como Google, GitHub)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type VARCHAR(50),
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

-- Tabla de tokens de verificación
CREATE TABLE IF NOT EXISTS verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL, -- email o user_id
    token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires ON verification_tokens(expires);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Limpiar tokens expirados (función de mantenimiento)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    -- Limpiar tokens de verificación expirados
    DELETE FROM verification_tokens WHERE expires < NOW();
    
    -- Limpiar tokens de reset de password expirados
    UPDATE users 
    SET password_reset_token = NULL, password_reset_expires = NULL 
    WHERE password_reset_expires < NOW();
    
    -- Limpiar sesiones expiradas
    DELETE FROM sessions WHERE expires < NOW();
    
    RAISE NOTICE 'Expired tokens cleaned up at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Tabla principal de usuarios del sistema';
COMMENT ON TABLE sessions IS 'Sesiones activas de usuarios (NextAuth)';
COMMENT ON TABLE accounts IS 'Cuentas OAuth vinculadas a usuarios';
COMMENT ON TABLE verification_tokens IS 'Tokens de verificación temporal';

COMMENT ON COLUMN users.email_verification_token IS 'Token para verificar email al registrarse';
COMMENT ON COLUMN users.password_reset_token IS 'Token temporal para resetear contraseña';
COMMENT ON COLUMN users.password_reset_expires IS 'Fecha de expiración del token de reset';

-- Insertar usuario admin de ejemplo (opcional para testing)
-- INSERT INTO users (email, name, password_hash, email_verified) 
-- VALUES ('admin@contatools.com', 'Admin', '$2b$12$example_hash_here', true)
-- ON CONFLICT (email) DO NOTHING;
