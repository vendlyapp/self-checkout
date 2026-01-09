/**
 * Script para regenerar todos los QR codes de productos con URLs completas
 * Ejecutar con: node scripts/regenerate-product-qrcodes.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { query } = require('../lib/database');
const qrCodeGenerator = require('../src/utils/qrCodeGenerator');
const storeService = require('../src/services/StoreService');

async function regenerateProductQRCodes() {
  try {
    console.log('🔄 Iniciando regeneración de QR codes de productos...\n');

    // Obtener todos los productos activos
    const productsResult = await query('SELECT id, "ownerId", name FROM "Product" WHERE "isActive" = true');
    const products = productsResult.rows;

    console.log(`📦 Encontrados ${products.length} productos activos\n`);

    let successCount = 0;
    let errorCount = 0;
    // Usar URL de producción por defecto para que los QR codes funcionen en producción
    // En desarrollo local, configurar FRONTEND_URL en .env
    const frontendUrl = process.env.FRONTEND_URL || 'https://self-checkout-kappa.vercel.app';

    for (const product of products) {
      try {
        // Obtener la tienda del producto
        const store = await storeService.getByOwnerId(product.ownerId);

        if (!store) {
          console.log(`⚠️  Producto ${product.id} (${product.name}): No se encontró tienda para ownerId ${product.ownerId}`);
          errorCount++;
          continue;
        }

        // Generar URL completa para el producto
        const productUrl = `${frontendUrl}/product/${product.id}`;

        // Generar nuevo QR code con URL completa
        const qrCode = await qrCodeGenerator.generateQRCode(product.id, product.name, productUrl);

        // Actualizar el QR code en la base de datos
        await query('UPDATE "Product" SET "qrCode" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2', [
          qrCode,
          product.id
        ]);

        console.log(`✅ Producto ${product.id} (${product.name}): QR code regenerado → ${productUrl}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error regenerando QR code para producto ${product.id} (${product.name}):`, error.message);
        errorCount++;
      }
    }

    console.log(`\n✨ Proceso completado:`);
    console.log(`   ✅ Exitosos: ${successCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📊 Total: ${products.length}`);

    await query.end?.(); // Cerrar conexión si existe
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    await query.end?.(); // Cerrar conexión si existe
    process.exit(1);
  }
}

// Ejecutar el script solo si se llama directamente
if (require.main === module) {
  regenerateProductQRCodes();
}

module.exports = { regenerateProductQRCodes };

