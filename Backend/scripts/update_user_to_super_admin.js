require('dotenv').config();
const { query } = require('../lib/database');

async function updateUserToSuperAdmin() {
  try {
    const email = 'admin@vendly.co';
    
    console.log('\n🔐 Actualizando usuario a Super Admin...\n');
    console.log(`📧 Email: ${email}\n`);

    // Actualizar el rol del usuario
    const updateQuery = `
      UPDATE "User" 
      SET role = 'SUPER_ADMIN', "updatedAt" = CURRENT_TIMESTAMP
      WHERE email = $1
      RETURNING id, email, name, role
    `;

    const result = await query(updateQuery, [email]);

    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    const user = result.rows[0];

    console.log('============================================================');
    console.log('🎉 USUARIO ACTUALIZADO A SUPER_ADMIN');
    console.log('============================================================');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Nombre: ${user.name}`);
    console.log(`🏷️  Rol: ${user.role}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log('============================================================\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

updateUserToSuperAdmin();

