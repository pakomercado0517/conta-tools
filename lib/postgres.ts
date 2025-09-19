import { Pool, PoolClient, QueryResult, QueryResultRow, PoolConfig } from 'pg';

// Tipos para la configuración del pool
interface DatabaseConfig extends PoolConfig {
  connectionString?: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  query_timeout?: number;
  statement_timeout?: number;
}

// Tipos para el resultado de conexión
interface ConnectionTestResult {
  current_time: Date;
  postgres_version: string;
}

// Tipos para logging de queries
interface QueryLog {
  text: string;
  duration: number;
  rows: number | null;
}

// Configuración del pool de conexiones PostgreSQL
const poolConfig: DatabaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase.co') 
    ? { rejectUnauthorized: false } 
    : false,
  max: 5, // Reducir conexiones para Supabase (tienen límites)
  idleTimeoutMillis: 10000, // Cerrar conexiones inactivas más rápido
  connectionTimeoutMillis: 5000, // Aumentar timeout para obtener conexión
  query_timeout: 15000, // Timeout para queries individuales
  statement_timeout: 15000, // Timeout a nivel de statement
};

const pool = new Pool(poolConfig);

/**
 * Función helper para ejecutar queries con logging y manejo de errores
 * @param text - SQL query string
 * @param params - Parámetros para el query (opcional)
 * @returns Resultado del query
 */
export const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> => {
  const start = Date.now();
  const client = await pool.connect();
  
  try {
    const res = await client.query<T>(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      const queryLog: QueryLog = {
        text,
        duration,
        rows: res.rowCount,
      };
      console.log('Executed query:', queryLog);
    }
    
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Tipo para callbacks de transacciones
 */
type TransactionCallback<T> = (client: PoolClient) => Promise<T>;

/**
 * Función helper para transacciones con rollback automático en caso de error
 * @param callback - Función que contiene las operaciones de la transacción
 * @returns Resultado de la transacción
 */
export const transaction = async <T>(
  callback: TransactionCallback<T>
): Promise<T> => {
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

/**
 * Función para cerrar el pool de conexiones (útil para testing)
 * @returns Promise que se resuelve cuando el pool se cierra completamente
 */
export const closePool = async (): Promise<void> => {
  await pool.end();
};

/**
 * Función para verificar la conexión a la base de datos
 * @returns true si la conexión es exitosa, false en caso contrario
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query<ConnectionTestResult>(
      'SELECT NOW() as current_time, version() as postgres_version'
    );
    
    if (result.rows.length > 0) {
      const { current_time, postgres_version } = result.rows[0];
      console.log('✅ PostgreSQL connected:', {
        time: current_time,
        version: postgres_version.split(' ')[0]
      });
    }
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ PostgreSQL connection failed:', errorMessage);
    return false;
  }
};

/**
 * Función para obtener información del estado del pool
 * @returns Información sobre el estado actual del pool
 */
export const getPoolInfo = () => {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
};

/**
 * Función para limpiar queries preparados (útil para desarrollo)
 */
export const clearPreparedStatements = async (): Promise<void> => {
  try {
    await query('DEALLOCATE ALL');
    console.log('✅ Cleared all prepared statements');
  } catch (error) {
    console.warn('⚠️  Could not clear prepared statements:', error);
  }
};

// Exportar el pool por defecto
export default pool;