require('dotenv').config();
const { query } = require('../lib/database');

async function showSuperAdminCredentials() {
  try {
    console.log('\n🔐 Buscando Super Admin...\n');

    // Buscar todos los usuarios con rol SUPER_ADMIN
    const result = await query(`
      SELECT id, email, name, role, "createdAt"
      FROM "User" 
      WHERE role = 'SUPER_ADMIN'
      ORDER BY "createdAt" DESC
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No se encontró ningún Super Admin en la base de datos.');
      console.log('\n💡 Para crear uno, ejecuta:');
      console.log('   node scripts/create_super_admin.js\n');
      process.exit(1);
    }

    console.log('============================================================');
    console.log('👤 SUPER ADMIN ENCONTRADO:');
    console.log('============================================================');
    
    result.rows.forEach((user, index) => {
      console.log(`\n${index + 1}. 📧 Email: ${user.email}`);
      console.log(`   👤 Nombre: ${user.name}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log(`   🏷️  Rol: ${user.role}`);
      console.log(`   📅 Creado: ${new Date(user.createdAt).toLocaleString()}`);
    });

    console.log('\n============================================================');
    console.log('⚠️  IMPORTANTE:');
    console.log('============================================================');
    console.log('Las contraseñas están encriptadas y no se pueden recuperar.');
    console.log('Si no recuerdas tu contraseña, puedes:');
    console.log('\n1. Resetear la contraseña:');
    console.log('   node scripts/reset_super_admin_password.js');
    console.log('\n2. O crear un nuevo Super Admin:');
    console.log('   node scripts/create_super_admin.js');
    console.log('\n3. Verificar las credenciales por defecto:');
    console.log('   Email: admin@vendly.co (o SUPER_ADMIN_EMAIL en .env)');
    console.log('   Password: Admin123! (o SUPER_ADMIN_PASSWORD en .env)');
    console.log('============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showSuperAdminCredentials();

