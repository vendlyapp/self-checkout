/**
 * Prueba del CRUD con SQL directo
 */

const productService = require('../src/services/ProductService');
const { testConnection } = require('../lib/database');

async function testCRUD() {
  console.log('🧪 Prueba del CRUD con SQL directo\n');

  try {
    // Probar conexión
    console.log('1️⃣ Probando conexión a la base de datos...');
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }
    console.log('✅ Conexión establecida\n');

    // Datos de prueba
    const testProduct = {
      name: "Pan SQL Test",
      description: "Pan de prueba con SQL directo",
      price: 2.50,
      category: "Brot",
      stock: 10,
      sku: "PAN-SQL-001",
      barcode: "1234567890001",
      supplier: "Panadería SQL",
      costPrice: 1.50,
      location: "Estante SQL",
      notes: "Producto de prueba SQL"
    };

    console.log('2️⃣ Creando producto...');
    const result = await productService.create(testProduct);
    console.log('✅ Producto creado:', result.data.name);
    console.log('📝 ID:', result.data.id);
    console.log('💰 Precio:', result.data.price);
    console.log('📦 Stock:', result.data.stock);
    console.log('🏪 SKU:', result.data.sku);
    console.log('🏢 Proveedor:', result.data.supplier);
    console.log('📍 Ubicación:', result.data.location);
    console.log('');

    const productId = result.data.id;

    console.log('3️⃣ Obteniendo producto por ID...');
    const getResult = await productService.findById(productId);
    console.log('✅ Producto obtenido:', getResult.data.name);
    console.log('');

    console.log('4️⃣ Actualizando producto...');
    const updateResult = await productService.update(productId, {
      name: "Pan SQL Actualizado",
      stock: 20,
      price: 3.00,
      supplier: "Proveedor SQL Actualizado"
    });
    console.log('✅ Producto actualizado:', updateResult.data.name);
    console.log('💰 Nuevo precio:', updateResult.data.price);
    console.log('📦 Nuevo stock:', updateResult.data.stock);
    console.log('🏢 Nuevo proveedor:', updateResult.data.supplier);
    console.log('');

    console.log('5️⃣ Listando todos los productos...');
    const listResult = await productService.findAll();
    console.log('✅ Total productos:', listResult.count);
    listResult.data.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - ${p.price} CHF - Stock: ${p.stock}`);
    });
    console.log('');

    console.log('6️⃣ Obteniendo estadísticas...');
    const statsResult = await productService.getStats();
    console.log('📊 Estadísticas:');
    console.log('   Total:', statsResult.data.total);
    console.log('   Disponibles:', statsResult.data.available);
    console.log('   Stock bajo:', statsResult.data.lowStock);
    console.log('   Sin stock:', statsResult.data.outOfStock);
    console.log('');

    console.log('7️⃣ Probando búsqueda...');
    const searchResult = await productService.search('Pan');
    console.log('🔍 Resultados de búsqueda:', searchResult.count);
    searchResult.data.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - ${p.price} CHF`);
    });
    console.log('');

    console.log('8️⃣ Eliminando producto...');
    const deleteResult = await productService.delete(productId);
    console.log('✅ Producto eliminado:', deleteResult.message);
    console.log('');

    console.log('🎉 ¡CRUD con SQL directo funcionando perfectamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('   1. Verificar que las tablas estén creadas en Supabase');
    console.log('   2. Verificar variables de entorno (.env)');
    console.log('   3. Verificar conexión a Supabase');
  }
}

testCRUD();
