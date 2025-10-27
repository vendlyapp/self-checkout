require('dotenv').config();
const { supabase } = require('../lib/supabase');
const { query } = require('../lib/database');

async function createSuperAdmin() {
  try {
    console.log('\n🔐 Creando Super Admin...\n');

    // Datos del super admin
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@vendly.co';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!';
    const name = 'Super Admin Vendly';

    console.log(`📧 Email: ${email}`);
    console.log(`👤 Nombre: ${name}\n`);

    // 1. Crear usuario en Supabase Auth
    console.log('1️⃣ Registrando usuario en Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'SUPER_ADMIN'
        }
      }
    });

    if (authError) {
      // Si el usuario ya existe, intentar hacer login para obtener el ID
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Usuario ya existe en Auth. Obteniendo ID...');
        const { data: existingUser, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (loginError) {
          throw new Error(`Usuario ya existe pero contraseña incorrecta: ${loginError.message}`);
        }

        const userId = existingUser.user.id;
        console.log(`✅ Usuario encontrado: ${userId}\n`);

        // 2. Verificar/Actualizar en la tabla User
        console.log('2️⃣ Verificando usuario en base de datos...');
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
      } else {
        throw authError;
      }
    }

    if (!authData.user) {
      throw new Error('Error al crear el usuario en Auth');
    }

    const userId = authData.user.id;
    console.log(`✅ Usuario creado en Auth: ${userId}\n`);

    // 2. Insertar en la tabla User
    console.log('2️⃣ Creando usuario en base de datos...');
    const insertQuery = `
      INSERT INTO "User" (id, email, name, role, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, role
    `;

    const result = await query(insertQuery, [userId, email, name, 'SUPER_ADMIN', 'supabase-auth']);
    console.log('✅ Usuario creado en base de datos\n');

    console.log('============================================================');
    console.log('🎉 SUPER ADMIN CREADO EXITOSAMENTE');
    console.log('============================================================');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Nombre: ${name}`);
    console.log(`🏷️  Rol: SUPER_ADMIN`);
    console.log(`🆔 ID: ${userId}`);
    console.log('============================================================\n');
    console.log('⚠️  IMPORTANTE:');
    console.log('   - Verifica tu email para confirmar la cuenta');
    console.log('   - O usa estas credenciales para login\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createSuperAdmin();

