import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyTables() {
  console.log('🔍 Verificando tablas en Supabase...');

  const tablesToCheck = ['users', 'sessions', 'accounts', 'verification_tokens'];
  let allTablesExist = true;

  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (error && error.code === 'PGRST116') {
        console.log(`❌ Tabla '${tableName}' no existe`);
        allTablesExist = false;
      } else if (error) {
        console.log(`⚠️  Tabla '${tableName}': ${error.message}`);
      } else {
        console.log(`✅ Tabla '${tableName}': OK`);
      }
    } catch (err) {
      console.log(`❌ Error verificando '${tableName}':`, err.message);
      allTablesExist = false;
    }
  }

  if (allTablesExist) {
    console.log('\n🎉 ¡Todas las tablas necesarias están disponibles!');
    console.log('✅ Ready para continuar con la migración de APIs');
  } else {
    console.log('\n⚠️  Algunas tablas faltan. Ejecuta el SQL en Supabase Dashboard primero.');
  }

  return allTablesExist;
}

verifyTables();
