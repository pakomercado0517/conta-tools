import { testConnection } from '../lib/postgres.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function testDatabaseConnection() {
  console.log('🔌 Probando conexión a Supabase PostgreSQL...');
  console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ Faltante');
  
  try {
    const connected = await testConnection();
    
    if (connected) {
      console.log('🎉 ¡Conexión exitosa a Supabase!');
      process.exit(0);
    } else {
      console.log('❌ Error de conexión');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Error inesperado:', error.message);
    process.exit(1);
  }
}

testDatabaseConnection();
