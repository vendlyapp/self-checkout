const { query } = require('../lib/database');
const storeService = require('../src/services/StoreService');

async function createUserAndStore() {
  try {
    const userId = '3276ce51-885b-48b7-b5d1-0e3a52896ef5'; // Tu ID de Supabase Auth
    const email = 'steven.rodriguez@vendly.co';
    const name = 'Steven Rodriguez';
    const role = 'ADMIN';

    console.log('👤 Creando usuario en tabla User...');
    
    // Crear usuario en tabla User
    await query(
      `INSERT INTO "User" (id, email, name, role, password) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (id) DO NOTHING`,
      [userId, email, name, role, 'google-oauth']
    );

    console.log('✅ Usuario creado');

    // Crear tienda
    console.log('🏪 Creando tienda...');
    const result = await storeService.create(userId, {
      name: `${name}'s Store`,
      logo: null
    });

    console.log('✅ Tienda creada:');
    console.log('   - Nombre:', result.data.name);
    console.log('   - Slug:', result.data.slug);
    console.log('   - QR generado:', result.data.qrCode ? 'Sí' : 'No');

    console.log('\n🎉 ¡Listo! Ahora puedes crear productos.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createUserAndStore();

