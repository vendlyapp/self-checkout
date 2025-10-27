require('dotenv').config();
const { query } = require('../lib/database');
const barcodeGenerator = require('../src/utils/barcodeGenerator');

async function generateBarcodesForExistingProducts() {
  try {
    console.log('\n🔍 Verificando y creando columna barcodeImage...\n');

    // Verificar si la columna barcodeImage existe
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Product' AND column_name='barcodeImage'
    `;

    const columnExists = await query(checkColumnQuery);

    if (columnExists.rows.length === 0) {
      console.log('📝 Columna barcodeImage no existe. Creándola...\n');
      const addColumnQuery = `ALTER TABLE "Product" ADD COLUMN "barcodeImage" TEXT`;
      await query(addColumnQuery);
      console.log('✅ Columna barcodeImage creada exitosamente\n');
    } else {
      console.log('✅ Columna barcodeImage ya existe\n');
    }

    console.log('🔍 Buscando productos existentes...\n');

    // Obtener todos los productos
    const selectQuery = `SELECT id, name, sku FROM "Product" ORDER BY "createdAt" ASC`;
    const result = await query(selectQuery);
    const products = result.rows;

    console.log(`📦 Encontrados ${products.length} productos:\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        console.log(`🔄 Procesando: ${product.name} (${product.id})`);

        // Generar código de barras usando el ID del producto
        const barcodeImage = await barcodeGenerator.generateBarcode(product.id, product.name);

        // Actualizar producto con la imagen del código de barras (igual que QR)
        const updateQuery = `UPDATE "Product" SET "barcodeImage" = $1 WHERE "id" = $2 RETURNING id`;
        await query(updateQuery, [barcodeImage, product.id]);

        console.log(`  ✅ Código de barras guardado`);
        successCount++;

      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n============================================================');
    console.log('📊 RESUMEN:');
    console.log('============================================================');
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📦 Total: ${products.length}`);
    console.log('============================================================\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error general:', error.message);
    process.exit(1);
  }
}

generateBarcodesForExistingProducts();
