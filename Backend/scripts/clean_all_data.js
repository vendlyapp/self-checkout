const { query } = require('../lib/database');

async function cleanAllData() {
  try {
    console.log('🧹 Limpiando base de datos...\n');

    // 1. Eliminar todos los productos
    const productsResult = await query('DELETE FROM "Product" RETURNING id');
    console.log(`✅ ${productsResult.rowCount} productos eliminados`);

    // 2. Eliminar todas las tiendas
    const storesResult = await query('DELETE FROM "Store" RETURNING id');
    console.log(`✅ ${storesResult.rowCount} tiendas eliminadas`);

    // 3. Eliminar todas las órdenes y order items
    await query('DELETE FROM "OrderItem"');
    const ordersResult = await query('DELETE FROM "Order" RETURNING id');
    console.log(`✅ ${ordersResult.rowCount} órdenes eliminadas`);

    // 4. Eliminar todos los usuarios de la tabla User (NO de Supabase Auth)
    const usersResult = await query('DELETE FROM "User" RETURNING id');
    console.log(`✅ ${usersResult.rowCount} usuarios eliminados de tabla User`);

    console.log('\n🎉 Base de datos limpia!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Registra un nuevo usuario admin');
    console.log('2. Se creará automáticamente su tienda');
    console.log('3. Crea productos → serán de ese admin');
    console.log('4. ¡Listo para probar multi-tenant!\n');

    console.log('⚠️  NOTA: Los usuarios siguen en Supabase Auth.');
    console.log('   Deberás registrarte de nuevo o limpiar Supabase Auth manualmente.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error.message);
    process.exit(1);
  }
}

cleanAllData();

