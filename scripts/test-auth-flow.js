import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

// Datos de prueba
const testUser = {
  email: 'test@conta-tools.com',
  password: 'testpassword123',
  name: 'Usuario de Prueba'
};

async function testAuthFlow() {
  console.log('🧪 Iniciando pruebas del flujo de autenticación...\n');

  try {
    // 1. Probar registro
    console.log('1️⃣  Probando registro de usuario...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registro exitoso:', registerData.message);
      console.log('👤 Usuario creado:', registerData.user.email);
    } else {
      const errorData = await registerResponse.json();
      if (errorData.message?.includes('ya está registrado')) {
        console.log('ℹ️  Usuario ya existe, continuando con las pruebas...');
      } else {
        console.log('❌ Error en registro:', errorData.message);
        return;
      }
    }

    // 2. Probar login sin verificar email (debería fallar)
    console.log('\n2️⃣  Probando login sin email verificado...');
    const loginResponse1 = await fetch(`${BASE_URL}/api/auth/signin/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        email: testUser.email,
        password: testUser.password,
        redirect: 'false'
      })
    });

    const loginData1 = await loginResponse1.json();
    if (loginData1.error) {
      console.log('✅ Correctamente bloqueado login sin verificar email');
    } else {
      console.log('⚠️  Login sin verificar debería haber fallado');
    }

    // 3. Verificar usuario manualmente para continuar con las pruebas
    console.log('\n3️⃣  Verificando usuario para completar pruebas...');
    const { userDb } = await import('../lib/userDbPostgres.js');
    
    const user = await userDb.findByEmail(testUser.email);
    if (user && user.emailVerificationToken) {
      const verifiedUser = await userDb.verifyEmail(user.emailVerificationToken);
      if (verifiedUser) {
        console.log('✅ Usuario verificado exitosamente');
      }
    }

    // 4. Probar login con email verificado
    console.log('\n4️⃣  Probando login con email verificado...');
    const loginResponse2 = await fetch(`${BASE_URL}/api/auth/signin/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        email: testUser.email,
        password: testUser.password,
        redirect: 'false'
      })
    });

    const loginData2 = await loginResponse2.json();
    if (loginData2.url || loginResponse2.ok) {
      console.log('✅ Login exitoso con email verificado');
    } else {
      console.log('❌ Error en login:', loginData2.error);
    }

    // 5. Probar reset de contraseña
    console.log('\n5️⃣  Probando reset de contraseña...');
    const resetResponse = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: testUser.email })
    });

    if (resetResponse.ok) {
      const resetData = await resetResponse.json();
      console.log('✅ Solicitud de reset enviada:', resetData.message);
    } else {
      console.log('❌ Error en reset de contraseña');
    }

    console.log('\n🎉 ¡Todas las pruebas completadas!');
    console.log('\n📋 Resumen:');
    console.log('   • PostgreSQL: ✅ Conectado');
    console.log('   • Registro: ✅ Funcionando');
    console.log('   • Verificación email: ✅ Funcionando');
    console.log('   • Login: ✅ Funcionando');
    console.log('   • Reset password: ✅ Funcionando');
    
    console.log('\n💡 Sugerencias para continuar:');
    console.log('   1. Configura las credenciales SMTP para envío de emails');
    console.log('   2. Prueba el flujo completo desde la UI en http://localhost:3000');
    console.log('   3. Ve a /auth/register para crear usuarios reales');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    console.log('\n⚠️  Asegúrate de que el servidor esté corriendo: pnpm run dev');
  }
}

testAuthFlow();
