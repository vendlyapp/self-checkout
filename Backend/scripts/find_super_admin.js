require('dotenv').config();
const { query } = require('../lib/database');

async function findSuperAdmin() {
  try {
    const result = await query(`
      SELECT id, email, name, role 
      FROM "User" 
      WHERE email LIKE '%admin%' 
      ORDER BY role DESC
    `);
    
    console.log('\n📋 Usuarios admin encontrados:\n');
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Nombre: ${user.name}`);
      console.log(`   Rol: ${user.role}\n`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

findSuperAdmin();

