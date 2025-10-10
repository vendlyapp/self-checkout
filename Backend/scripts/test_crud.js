const productService = require('../src/services/ProductService');
const { testConnection } = require('../lib/database');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

async function testCRUD() {
  log('\n🧪 Test CRUD de Productos - Vendly Checkout\n', 'blue');

  try {
    log('1️⃣ Verificando conexión...', 'yellow');
    const connected = await testConnection();
    if (!connected) throw new Error('No se pudo conectar a la base de datos');
    log('✅ Conexión exitosa\n', 'green');

    const testProduct = {
      name: "Test Product QR",
      description: "Producto de prueba con QR automático",
      price: 9.99,
      category: "Brot",
      notes: "Test product con sistema optimizado"
    };

    log('2️⃣ Creando producto...', 'yellow');
    const created = await productService.create(testProduct);
    log('✅ Producto creado', 'green');
    log(`   ID: ${created.data.id}`);
    log(`   Nombre: ${created.data.name}`);
    log(`   Precio: CHF ${created.data.price}`);
    log(`   Stock: ${created.data.stock}`);
    log(`   SKU: ${created.data.sku}`);
    log(`   QR Code: ${created.data.qrCode ? '✅ Generado' : '❌ No'}\n`);

    const productId = created.data.id;

    log('3️⃣ Obteniendo producto por ID...', 'yellow');
    const found = await productService.findById(productId);
    log('✅ Producto encontrado', 'green');
    log(`   ${found.data.name} - CHF ${found.data.price}\n`);

    log('4️⃣ Listando todos los productos...', 'yellow');
    const all = await productService.findAll({ limit: 5 });
    log(`✅ ${all.data.length} productos encontrados`, 'green');
    all.data.forEach((p, i) => {
      log(`   ${i + 1}. ${p.name} - CHF ${p.price} - Stock: ${p.stock}`);
    });
    log('');

    log('5️⃣ Actualizando producto...', 'yellow');
    const updated = await productService.update(productId, {
      price: 12.50,
      name: "Test Product Updated"
    });
    log('✅ Producto actualizado', 'green');
    log(`   ${updated.data.name} - CHF ${updated.data.price}\n`);

    log('6️⃣ Obteniendo estadísticas...', 'yellow');
    const stats = await productService.getStats();
    log('✅ Estadísticas obtenidas', 'green');
    log(`   Total: ${stats.data.total}`);
    log(`   Disponibles: ${stats.data.available}`);
    log(`   Stock bajo: ${stats.data.lowStock}\n`);

    log('7️⃣ Eliminando producto de prueba...', 'yellow');
    await productService.delete(productId);
    log('✅ Producto eliminado\n', 'green');

    log('🎉 ¡Todas las pruebas pasaron exitosamente!\n', 'green');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    log('\n💡 Verifica:', 'yellow');
    log('   1. Base de datos creada (npm run db:setup)');
    log('   2. Archivo .env configurado');
    log('   3. Conexión a Supabase\n');
    process.exit(1);
  }
}

if (require.main === module) {
  testCRUD().then(() => process.exit(0));
}

module.exports = { testCRUD };
