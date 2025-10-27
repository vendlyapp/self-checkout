require('dotenv').config();
const { query } = require('../lib/database');

async function syncAuthId() {
  try {
    const email = 'admin@vendly.co';
    const authId = 'd0a85427-1a96-4ad7-b561-32039136c073';
    const dbId = '370619a9-d1b4-4ade-ae74-2c67b2e6454c';
    
    console.log('\n🔄 Sincronizando ID de Auth con la base de datos...\n');
    
    // Actualizar el ID para que coincida con Auth
    const updateQuery = `
      UPDATE "User" 
      SET id = $1
      WHERE email = $2
      RETURNING id, email, name, role
    `;
    
    const result = await query(updateQuery, [authId, email]);
    
    if (result.rows.length > 0) {
      console.log('✅ Usuario actualizado:');
      console.log(`ID: ${result.rows[0].id}`);
      console.log(`Email: ${result.rows[0].email}`);
      console.log(`Rol: ${result.rows[0].role}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

syncAuthId();

