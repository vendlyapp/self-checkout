require('dotenv').config();
const { supabase } = require('../lib/supabase');
const { query } = require('../lib/database');

async function resetAdminPassword() {
  try {
    console.log('\n🔐 Reseteando contraseña de admin@vendly.co...\n');

    const email = 'admin@vendly.co';
    const newPassword = 'SuperAdmin123!';

    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Nueva Password: ${newPassword}\n`);

    // 1. Intentar hacer login con la nueva contraseña primero (para verificar si ya funciona)
    console.log('1️⃣ Verificando credenciales actuales...');
    const { data: testLogin, error: testError } = await supabase.auth.signInWithPassword({
      email,
      password: newPassword
    });

    if (testLogin && testLogin.user) {
      console.log('✅ Las credenciales ya funcionan correctamente!\n');
      console.log('============================================================');
      console.log('🎉 CREDENCIALES VÁLIDAS');
      console.log('============================================================');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${newPassword}`);
      console.log('============================================================\n');
      process.exit(0);
    }

    // 2. Si no funciona, intentar resetear
    console.log('2️⃣ Reseteando contraseña en Supabase Auth...');
    console.log('   (Esto enviará un email de reseteo)\n');

    // Método 1: Resetear mediante email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/auth/reset-password'
    });

    if (resetError) {
      console.log('⚠️  No se pudo enviar email de reseteo automático.');
      console.log('   Intentando método alternativo...\n');

      // Método 2: Intentar actualizar directamente (solo funciona si tenemos sesión)
      // Primero intentar login con cualquier contraseña para obtener el usuario
      const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
        email,
        password: 'temp123' // Contraseña temporal
      });

      if (userData && userData.user) {
        // Si tenemos sesión, actualizar contraseña
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateError) {
          throw new Error(`No se pudo actualizar: ${updateError.message}`);
        }

        console.log('✅ Contraseña actualizada exitosamente!\n');
      } else {
        console.log('⚠️  No se pudo resetear automáticamente.');
        console.log('\n📋 OPCIONES:');
        console.log('============================================================');
        console.log('1. Ve al dashboard de Supabase:');
        console.log('   https://supabase.com/dashboard');
        console.log('   → Authentication → Users');
        console.log('   → Busca: admin@vendly.co');
        console.log('   → Click en "..." → "Reset Password"');
        console.log('\n2. O usa el email de reseteo que se envió');
        console.log('   (si se envió correctamente)');
        console.log('\n3. O ejecuta este comando para resetear manualmente:');
        console.log('   node scripts/reset_super_admin_password.js');
        console.log('============================================================\n');
        process.exit(1);
      }
    } else {
      console.log('✅ Email de reseteo enviado a: ' + email);
      console.log('\n⚠️  IMPORTANTE:');
      console.log('   Verifica tu correo y sigue el enlace para resetear.');
      console.log('   O usa el dashboard de Supabase para resetear manualmente.\n');
    }

    // 3. Verificar/Actualizar en la base de datos
    console.log('3️⃣ Verificando usuario en base de datos...');
    const dbQuery = `
      SELECT id, email, name, role 
      FROM "User" 
      WHERE email = $1
    `;
    const dbResult = await query(dbQuery, [email]);

    if (dbResult.rows.length > 0) {
      // Actualizar rol a SUPER_ADMIN si no lo es
      if (dbResult.rows[0].role !== 'SUPER_ADMIN') {
        const updateQuery = `
          UPDATE "User" 
          SET role = 'SUPER_ADMIN'
          WHERE email = $1
          RETURNING id, email, name, role
        `;
        await query(updateQuery, [email]);
        console.log('✅ Rol actualizado a SUPER_ADMIN en base de datos');
      } else {
        console.log('✅ Usuario ya tiene rol SUPER_ADMIN en base de datos');
      }

      console.log('\n============================================================');
      console.log('📋 USUARIO EN BASE DE DATOS:');
      console.log('============================================================');
      console.log(`📧 Email: ${dbResult.rows[0].email}`);
      console.log(`👤 Nombre: ${dbResult.rows[0].name}`);
      console.log(`🏷️  Rol: ${dbResult.rows[0].role}`);
      console.log(`🆔 ID: ${dbResult.rows[0].id}`);
      console.log('============================================================\n');
    }

    console.log('============================================================');
    console.log('🎉 PROCESO COMPLETADO');
    console.log('============================================================');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Nueva Password: ${newPassword}`);
    console.log('\n⚠️  Si el reseteo automático no funcionó:');
    console.log('   1. Ve al dashboard de Supabase');
    console.log('   2. Authentication → Users');
    console.log('   3. Busca admin@vendly.co');
    console.log('   4. Reset Password manualmente');
    console.log('============================================================\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

resetAdminPassword();

