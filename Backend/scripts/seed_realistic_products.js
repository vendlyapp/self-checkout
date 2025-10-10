const { query } = require('../lib/database');
const qrCodeGenerator = require('../src/utils/qrCodeGenerator');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const realisticProducts = [
  { name: 'Äpfel Gala Suisse', description: 'Frische Schweizer Äpfel', price: 4.50, category: 'Obst & Gemüse', isPopular: true },
  { name: 'Vollkornbrot Bio', description: 'Hausgemachtes Vollkornbrot', price: 5.20, category: 'Brot', isNew: true },
  { name: 'Emmentaler AOP', description: 'Schweizer Käse Premium', price: 12.90, category: 'Milchprodukte', originalPrice: 15.90 },
  { name: 'Tomaten Cherry', description: 'Bio Cherry Tomaten 250g', price: 3.80, category: 'Obst & Gemüse' },
  { name: 'Croissant Butter', description: 'Frisch gebacken jeden Morgen', price: 2.50, category: 'Gebäck', isPopular: true },
  { name: 'Mineralwasser Still', description: 'Schweizer Quellwasser 1.5L', price: 1.20, category: 'Getränke' },
  { name: 'Jogurt Natur Bio', description: 'Schweizer Bio Jogurt 500g', price: 2.80, category: 'Milchprodukte' },
  { name: 'Baguette Klassisch', description: 'Knuspriges französisches Baguette', price: 2.90, category: 'Brot' },
  { name: 'Bananen Ecuador', description: 'Reife Bananen pro kg', price: 2.60, category: 'Obst & Gemüse' },
  { name: 'Schokoladecroissant', description: 'Mit dunkler Schokolade', price: 3.50, category: 'Gebäck', isOnSale: true, originalPrice: 4.20 },
  { name: 'Orangensaft Fresh', description: 'Frisch gepresst 1L', price: 5.90, category: 'Getränke', isNew: true },
  { name: 'Milch Vollmilch', description: 'Frische Vollmilch 1L', price: 1.80, category: 'Milchprodukte' },
  { name: 'Karotten Bio', description: 'Bio Karotten aus der Region', price: 3.20, category: 'Obst & Gemüse' },
  { name: 'Zopf Sonntag', description: 'Traditioneller Schweizer Zopf', price: 6.50, category: 'Brot', isPopular: true },
  { name: 'Apfelstrudel', description: 'Hausgemacht mit Rosinen', price: 4.80, category: 'Gebäck' },
  { name: 'Mineralwasser Sprudel', description: 'Mit Kohlensäure 1.5L', price: 1.20, category: 'Getränke' },
  { name: 'Mozzarella Bufala', description: 'Italienische Mozzarella 125g', price: 4.50, category: 'Milchprodukte', isNew: true },
  { name: 'Salat Mix', description: 'Frischer gemischter Salat', price: 3.90, category: 'Obst & Gemüse' },
  { name: 'Brötchen Sesam', description: '6er Pack Sesambrötchen', price: 3.60, category: 'Brot' },
  { name: 'Eistee Zitrone', description: 'Erfrischender Eistee 1L', price: 2.90, category: 'Getränke', isOnSale: true, originalPrice: 3.50 }
];

async function seedProducts() {
  try {
    log('\n🌱 Iniciando seed de productos realistas...', 'cyan');
    log('='.repeat(60), 'cyan');

    log('\n🗑️  Limpiando productos existentes...', 'yellow');
    await query('DELETE FROM "OrderItem"');
    await query('DELETE FROM "Product"');
    log('✅ Productos anteriores eliminados', 'green');

    log('\n📦 Creando 20 productos nuevos...', 'blue');
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < realisticProducts.length; i++) {
      const prod = realisticProducts[i];
      
      try {
        const categoryId = prod.category.toLowerCase().replace(/\s+/g, '_').replace(/ü/g, 'u').replace(/ä/g, 'a').replace(/ö/g, 'o');
        const sku = `SKU-${Date.now()}-${i}`;
        
        const insertQuery = `
          INSERT INTO "Product" (
            "name", "description", "price", "originalPrice", "category", "categoryId",
            "stock", "initialStock", "sku", "isNew", "isPopular", "isOnSale", 
            "isActive", "currency", "discountPercentage"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
          ) RETURNING *
        `;

        const discountPercentage = prod.originalPrice 
          ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
          : null;

        const values = [
          prod.name,
          prod.description,
          prod.price,
          prod.originalPrice || null,
          prod.category,
          categoryId,
          999,
          999,
          sku,
          prod.isNew || false,
          prod.isPopular || false,
          prod.isOnSale || false,
          true,
          'CHF',
          discountPercentage
        ];

        const result = await query(insertQuery, values);
        const product = result.rows[0];

        const qrCode = await qrCodeGenerator.generateQRCode(product.id, product.name);
        await query('UPDATE "Product" SET "qrCode" = $1 WHERE "id" = $2', [qrCode, product.id]);

        successCount++;
        log(`  ${successCount}. ✅ ${prod.name} - ${prod.category}`, 'green');
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        errorCount++;
        log(`  ❌ Error creando "${prod.name}": ${error.message}`, 'red');
      }
    }

    log('\n' + '='.repeat(60), 'cyan');
    log(`📊 Resultados:`, 'bright');
    log(`   ✅ Creados: ${successCount}`, 'green');
    if (errorCount > 0) {
      log(`   ❌ Errores: ${errorCount}`, 'red');
    }
    log('='.repeat(60), 'cyan');

    const totalResult = await query('SELECT COUNT(*) as count FROM "Product"');
    log(`\n📦 Total de productos en BD: ${totalResult.rows[0].count}`, 'bright');
    
    log('\n🎉 ¡Seed completado exitosamente!\n', 'green');
    process.exit(0);
    
  } catch (error) {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts };

