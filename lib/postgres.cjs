const { Pool } = require('pg');

// Configuración del pool de conexiones PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase.co') ? { rejectUnauthorized: false } : false,
  max: 5, // Reducir conexiones para Supabase (tienen límites)
  idleTimeoutMillis: 10000, // Cerrar conexiones inactivas más rápido
  connectionTimeoutMillis: 5000, // Aumentar timeout para obtener conexión
  query_timeout: 15000, // Timeout para queries individuales
  statement_timeout: 15000, // Timeout a nivel de statement
});

// Función helper para ejecutar queries
const query = async (text, params) => {
  const start = Date.now();
  let client;
  
  try {
    client = await pool.connect();
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query:', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Database query error:', error.message);
    // Verificar si es un error de timeout o conexión
    if (error.message?.includes('timeout') || error.message?.includes('Connection terminated')) {
      console.warn('Database connection issue - query might have succeeded');
    }
    throw error;
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError.message);
      }
    }
  }
};

// Función helper para transacciones
const transaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Función para cerrar el pool (útil para testing)
const closePool = async () => {
  await pool.end();
};

// Función para verificar conexión
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ PostgreSQL connected:', {
      time: result.rows[0].current_time,
      version: result.rows[0].postgres_version.split(' ')[0]
    });
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
};

module.exports = {
  query,
  transaction,
  closePool,
  testConnection,
  pool
};
