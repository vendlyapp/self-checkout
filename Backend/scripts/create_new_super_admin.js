require('dotenv').config();
const { supabase } = require('../lib/supabase');
const { query } = require('../lib/database');

async function createNewSuperAdmin() {
  try {
    console.log('\n🔐 Creando Nuevo Super Admin...\n');

    // Credenciales claras y fáciles de recordar
    const email = 'admin@vendly.co';
    const password = 'SuperAdmin123!';
    const name = 'Super Admin';

    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Nombre: ${name}\n`);

    // 1. Verificar si el usuario ya existe en Auth
    console.log('1️⃣ Verificando si el usuario ya existe...');
    
    // Intentar login primero para ver si existe
    const { data: existingAuth, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (existingAuth && existingAuth.user) {
      console.log('⚠️  Usuario ya existe en Supabase Auth');
      const userId = existingAuth.user.id;
      
      // Verificar/Actualizar en la tabla User
      console.log('2️⃣ Actualizando usuario en base de datos...');
      const updateQuery = `
        UPDATE "User" 
        SET name = $1, role = 'SUPER_ADMIN'
        WHERE id = $2
        RETURNING id, email, name, role
      `;
      const result = await query(updateQuery, [name, userId]);

      if (result.rows.length === 0) {
        // Insertar si no existe
        const insertQuery = `
          INSERT INTO "User" (id, email, name, role, password)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, email, name, role
        `;
        await query(insertQuery, [userId, email, name, 'SUPER_ADMIN', 'supabase-auth']);
        console.log('✅ Usuario creado en base de datos');
      } else {
        console.log('✅ Usuario actualizado en base de datos');
      }

      console.log('\n============================================================');
      console.log('🎉 SUPER ADMIN CONFIGURADO EXITOSAMENTE');
      console.log('============================================================');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
      console.log(`👤 Nombre: ${name}`);
      console.log(`🏷️  Rol: SUPER_ADMIN`);
      console.log(`🆔 ID: ${userId}`);
      console.log('============================================================\n');
      
      process.exit(0);
    }

    // Si no existe, crear nuevo usuario
    console.log('2️⃣ Creando nuevo usuario en Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: {
          name,
          role: 'SUPER_ADMIN'
        }
      }
    });

    if (authError) {
      // Si el error es que ya existe pero no pudimos hacer login, intentar resetear contraseña
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Usuario ya existe. Intentando resetear contraseña...');
        
        // Intentar resetear contraseña
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'http://localhost:3000'
        });
        
        if (resetError) {
          console.log('⚠️  No se pudo resetear automáticamente.');
          console.log('   Por favor, usa el portal de Supabase para resetear la contraseña.');
          console.log('   O intenta crear un usuario con email diferente.\n');
        } else {
          console.log('✅ Email de reseteo enviado. Verifica tu correo.');
        }
        
        // Buscar el usuario en la base de datos
        const findQuery = `
          SELECT id, email, name, role 
          FROM "User" 
          WHERE email = $1
        `;
        const userResult = await query(findQuery, [email]);
        
        if (userResult.rows.length > 0) {
          console.log('\n============================================================');
          console.log('📋 USUARIO ENCONTRADO EN BASE DE DATOS:');
          console.log('============================================================');
          console.log(`📧 Email: ${userResult.rows[0].email}`);
          console.log(`👤 Nombre: ${userResult.rows[0].name}`);
          console.log(`🏷️  Rol: ${userResult.rows[0].role}`);
          console.log(`🆔 ID: ${userResult.rows[0].id}`);
          console.log('============================================================');
          console.log('\n⚠️  El usuario existe pero la contraseña no funciona.');
          console.log('   Opciones:');
          console.log('   1. Usa el email de reseteo que se envió');
          console.log('   2. O ejecuta: node scripts/reset_super_admin_password.js');
          console.log('============================================================\n');
        }
        
        process.exit(1);
      } else {
        throw authError;
      }
    }

    if (!authData.user) {
      throw new Error('Error al crear el usuario en Auth');
    }

    const userId = authData.user.id;
    console.log(`✅ Usuario creado en Auth: ${userId}\n`);

    // 3. Insertar o actualizar en la tabla User
    console.log('3️⃣ Creando/Actualizando usuario en base de datos...');
    
    // Primero intentar actualizar por email si existe
    const updateQuery = `
      UPDATE "User" 
      SET id = $1, name = $2, role = 'SUPER_ADMIN', password = $3
      WHERE email = $4
      RETURNING id, email, name, role
    `;
    let result = await query(updateQuery, [userId, name, 'supabase-auth', email]);

    // Si no se actualizó, insertar
    if (result.rows.length === 0) {
      const insertQuery = `
        INSERT INTO "User" (id, email, name, role, password)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, name, role
      `;
      result = await query(insertQuery, [userId, email, name, 'SUPER_ADMIN', 'supabase-auth']);
      console.log('✅ Usuario creado en base de datos\n');
    } else {
      console.log('✅ Usuario actualizado en base de datos\n');
    }

    console.log('============================================================');
    console.log('🎉 SUPER ADMIN CREADO EXITOSAMENTE');
    console.log('============================================================');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Nombre: ${name}`);
    console.log(`🏷️  Rol: SUPER_ADMIN`);
    console.log(`🆔 ID: ${userId}`);
    console.log('============================================================');
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   - Si Supabase requiere confirmación de email, verifica tu correo');
    console.log('   - Si no, puedes usar estas credenciales para login inmediatamente');
    console.log('\n🌐 URL de login:');
    console.log('   http://localhost:3000/super-admin-login');
    console.log('   o');
    console.log('   http://localhost:3000/(auth)/login');
    console.log('============================================================\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createNewSuperAdmin();

