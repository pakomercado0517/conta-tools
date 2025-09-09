import fs from 'fs/promises';
import path from 'path';
import { userDb } from '../lib/userDbPostgres.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function migrateUsers() {
  console.log('🔄 Iniciando migración de usuarios de JSON a PostgreSQL...');
  
  const jsonPath = './data/users.json';
  
  try {
    // Verificar si existe el archivo JSON
    await fs.access(jsonPath);
  } catch (error) {
    console.log('📝 No se encontró archivo users.json - No hay usuarios para migrar');
    return;
  }

  try {
    // Leer usuarios del archivo JSON
    const jsonData = await fs.readFile(jsonPath, 'utf8');
    const usersData = JSON.parse(jsonData);
    
    if (!usersData.users || usersData.users.length === 0) {
      console.log('📝 No hay usuarios en el archivo JSON para migrar');
      return;
    }

    console.log(`👥 Encontrados ${usersData.users.length} usuarios para migrar`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Migrar cada usuario
    for (const jsonUser of usersData.users) {
      try {
        // Verificar si el usuario ya existe en PostgreSQL
        const existingUser = await userDb.findByEmail(jsonUser.email);
        
        if (existingUser) {
          console.log(`⏭️  Usuario ${jsonUser.email} ya existe en PostgreSQL - omitiendo`);
          skippedCount++;
          continue;
        }

        // Crear usuario en PostgreSQL usando los datos del JSON
        // Nota: La contraseña ya está hasheada en el JSON, la usamos directamente
        console.log(`➡️  Migrando usuario: ${jsonUser.email}`);
        
        // Usar SQL directo para insertar con password_hash ya hasheada
        const result = await userDb.query(`
          INSERT INTO users (
            email, 
            name, 
            password_hash, 
            email_verified, 
            email_verification_token,
            password_reset_token,
            password_reset_expires,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id, email, name, email_verified
        `, [
          jsonUser.email,
          jsonUser.name,
          jsonUser.password, // La contraseña ya está hasheada en JSON
          jsonUser.emailVerified || false,
          jsonUser.emailVerificationToken || null,
          jsonUser.passwordResetToken || null,
          jsonUser.passwordResetExpires ? new Date(jsonUser.passwordResetExpires) : null,
          jsonUser.createdAt ? new Date(jsonUser.createdAt) : new Date()
        ]);

        console.log(`✅ Usuario migrado: ${result.rows[0].email} (ID: ${result.rows[0].id})`);
        migratedCount++;

      } catch (userError) {
        console.error(`❌ Error migrando usuario ${jsonUser.email}:`, userError.message);
        errorCount++;
      }
    }

    console.log('\n📊 Resumen de migración:');
    console.log(`   ✅ Migrados exitosamente: ${migratedCount}`);
    console.log(`   ⏭️  Omitidos (ya existían): ${skippedCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);

    if (migratedCount > 0) {
      // Crear backup del archivo JSON original
      const backupPath = `./data/users.json.backup.${Date.now()}`;
      await fs.copyFile(jsonPath, backupPath);
      console.log(`\n💾 Backup creado en: ${backupPath}`);
      
      console.log('\n🎉 ¡Migración completada exitosamente!');
      console.log('💡 Tip: Puedes eliminar el archivo users.json ahora que los datos están en PostgreSQL');
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  }
}

// Función auxiliar para acceder a query directamente
userDb.query = async (text, params) => {
  const { query } = await import('../lib/postgres.js');
  return await query(text, params);
};

migrateUsers();
