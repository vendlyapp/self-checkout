require('dotenv').config();
const { supabase } = require('../lib/supabase');
const { query } = require('../lib/database');

async function verifyUserRole() {
  try {
    console.log('\n🔍 Verificando usuario admin@vendly.co...\n');

    const email = 'admin@vendly.co';
    const password = 'SuperAdmin123!';

    // 1. Intentar login para obtener el userId de Supabase Auth
    console.log('1️⃣ Intentando login en Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('❌ Error en login:', authError.message);
      console.log('\n⚠️  El usuario no puede hacer login. Verifica la contraseña.');
      process.exit(1);
    }

    const authUserId = authData.user.id;
    console.log(`✅ Login exitoso!`);
    console.log(`   Auth User ID: ${authUserId}\n`);

    // 2. Verificar en la base de datos
    console.log('2️⃣ Verificando en base de datos...');
    const dbResult = await query(
      'SELECT id, email, name, role FROM "User" WHERE email = $1',
      [email]
    );

    if (dbResult.rows.length === 0) {
      console.error('❌ Usuario no encontrado en base de datos!');
      process.exit(1);
    }

    const dbUser = dbResult.rows[0];
    console.log(`✅ Usuario encontrado en base de datos:`);
    console.log(`   DB User ID: ${dbUser.id}`);
    console.log(`   Email: ${dbUser.email}`);
    console.log(`   Name: ${dbUser.name}`);
    console.log(`   Role: ${dbUser.role}\n`);

    // 3. Verificar si los IDs coinciden
    if (authUserId !== dbUser.id) {
      console.log('⚠️  ⚠️  ⚠️  PROBLEMA DETECTADO ⚠️  ⚠️  ⚠️');
      console.log('============================================================');
      console.log('Los IDs NO coinciden!');
      console.log(`Auth ID: ${authUserId}`);
      console.log(`DB ID:   ${dbUser.id}`);
      console.log('============================================================\n');
      console.log('🔧 Solución: Actualizar el ID en la base de datos...\n');

      // Actualizar el ID en la base de datos
      const updateQuery = `
        UPDATE "User" 
        SET id = $1, role = 'SUPER_ADMIN'
        WHERE email = $2
        RETURNING id, email, name, role
      `;
      const updateResult = await query(updateQuery, [authUserId, email]);
      
      console.log('✅ Usuario actualizado en base de datos:');
      console.log(`   ID: ${updateResult.rows[0].id}`);
      console.log(`   Email: ${updateResult.rows[0].email}`);
      console.log(`   Role: ${updateResult.rows[0].role}\n`);
    } else {
      console.log('✅ Los IDs coinciden correctamente!\n');
    }

    // 4. Verificar el rol
    if (dbUser.role !== 'SUPER_ADMIN') {
      console.log('⚠️  El rol NO es SUPER_ADMIN!');
      console.log(`   Rol actual: ${dbUser.role}\n`);
      console.log('🔧 Actualizando rol a SUPER_ADMIN...\n');

      const updateRoleQuery = `
        UPDATE "User" 
        SET role = 'SUPER_ADMIN'
        WHERE id = $1
        RETURNING id, email, name, role
      `;
      const roleResult = await query(updateRoleQuery, [authUserId]);
      
      console.log('✅ Rol actualizado:');
      console.log(`   Role: ${roleResult.rows[0].role}\n`);
    } else {
      console.log('✅ El rol es SUPER_ADMIN correctamente!\n');
    }

    console.log('============================================================');
    console.log('🎉 VERIFICACIÓN COMPLETA');
    console.log('============================================================');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🆔 Auth ID: ${authUserId}`);
    console.log(`🏷️  Role: SUPER_ADMIN`);
    console.log('============================================================');
    console.log('\n✅ El usuario debería poder hacer login y ser redirigido a /super-admin/dashboard\n');

    // Cerrar sesión
    await supabase.auth.signOut();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

verifyUserRole();

