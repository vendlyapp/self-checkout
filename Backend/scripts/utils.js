const { query } = require('../lib/database');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para mostrar estadísticas de la base de datos
async function showDatabaseStats() {
  try {
    log('📊 Estadísticas de la Base de Datos Vendly Checkout', 'blue');
    log('=' * 55, 'blue');

    // Estadísticas de usuarios
    const userStats = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE role = 'ADMIN') as admins,
        COUNT(*) FILTER (WHERE role = 'CUSTOMER') as customers
      FROM "User"
    `);

    log('\n👥 Usuarios:', 'cyan');
    log(`   Total: ${userStats.rows[0].total}`, 'green');
    log(`   Administradores: ${userStats.rows[0].admins}`, 'green');
    log(`   Clientes: ${userStats.rows[0].customers}`, 'green');

    // Estadísticas de categorías
    const categoryStats = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE count > 0) as withProducts,
        COUNT(*) FILTER (WHERE count = 0) as empty
      FROM "ProductCategory"
    `);

    log('\n📁 Categorías:', 'cyan');
    log(`   Total: ${categoryStats.rows[0].total}`, 'green');
    log(`   Con productos: ${categoryStats.rows[0].withproducts}`, 'green');
    log(`   Vacías: ${categoryStats.rows[0].empty}`, 'yellow');

    // Estadísticas de productos
    const productStats = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "isActive" = true) as active,
        COUNT(*) FILTER (WHERE stock > 0) as inStock,
        COUNT(*) FILTER (WHERE stock = 0) as outOfStock,
        COUNT(*) FILTER (WHERE stock < 10 AND stock > 0) as lowStock
      FROM "Product"
    `);

    log('\n🛍️  Productos:', 'cyan');
    log(`   Total: ${productStats.rows[0].total}`, 'green');
    log(`   Activos: ${productStats.rows[0].active}`, 'green');
    log(`   En stock: ${productStats.rows[0].instock}`, 'green');
    log(`   Sin stock: ${productStats.rows[0].outofstock}`, 'red');
    log(`   Stock bajo: ${productStats.rows[0].lowstock}`, 'yellow');

    // Estadísticas de órdenes
    const orderStats = await query(`
      SELECT
        COUNT(*) as total,
        COALESCE(SUM(total), 0) as totalRevenue,
        COALESCE(AVG(total), 0) as averageOrder,
        COUNT(*) FILTER (WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days') as recent
      FROM "Order"
    `);

    log('\n📦 Órdenes:', 'cyan');
    log(`   Total: ${orderStats.rows[0].total}`, 'green');
    log(`   Ingresos totales: ${parseFloat(orderStats.rows[0].totalrevenue).toFixed(2)} CHF`, 'green');
    log(`   Promedio por orden: ${parseFloat(orderStats.rows[0].averageorder).toFixed(2)} CHF`, 'green');
    log(`   Últimos 30 días: ${orderStats.rows[0].recent}`, 'green');

    log('\n🎉 Estadísticas completadas', 'green');

  } catch (error) {
    log(`❌ Error obteniendo estadísticas: ${error.message}`, 'red');
  }
}

// Función para mostrar los últimos productos creados
async function showRecentProducts(limit = 5) {
  try {
    log(`\n🆕 Últimos ${limit} productos creados:`, 'cyan');

    const products = await query(`
      SELECT name, price, stock, sku, "createdAt"
      FROM "Product"
      ORDER BY "createdAt" DESC
      LIMIT $1
    `, [limit]);

    products.rows.forEach((p, i) => {
      log(`   ${i + 1}. ${p.name} - ${p.price} CHF - Stock: ${p.stock}`, 'green');
      log(`      SKU: ${p.sku} - Creado: ${new Date(p.createdAt).toLocaleString()}`, 'blue');
    });

  } catch (error) {
    log(`❌ Error obteniendo productos recientes: ${error.message}`, 'red');
  }
}

// Función para mostrar las categorías con más productos
async function showTopCategories() {
  try {
    log('\n🏆 Categorías con más productos:', 'cyan');

    const categories = await query(`
      SELECT name, icon, count, color
      FROM "ProductCategory"
      ORDER BY count DESC
      LIMIT 5
    `);

    categories.rows.forEach((c, i) => {
      log(`   ${i + 1}. ${c.name} ${c.icon} - ${c.count} productos`, 'green');
    });

  } catch (error) {
    log(`❌ Error obteniendo categorías: ${error.message}`, 'red');
  }
}

// Función para verificar la salud de la base de datos
async function checkDatabaseHealth() {
  try {
    log('🏥 Verificando salud de la base de datos...', 'blue');

    const checks = [
      { name: 'Conexión a Supabase', test: () => query('SELECT NOW()') },
      { name: 'Tabla User', test: () => query('SELECT COUNT(*) FROM "User"') },
      { name: 'Tabla ProductCategory', test: () => query('SELECT COUNT(*) FROM "ProductCategory"') },
      { name: 'Tabla Product', test: () => query('SELECT COUNT(*) FROM "Product"') },
      { name: 'Tabla Order', test: () => query('SELECT COUNT(*) FROM "Order"') },
      { name: 'Tabla OrderItem', test: () => query('SELECT COUNT(*) FROM "OrderItem"') }
    ];

    let passedChecks = 0;

    for (const check of checks) {
      try {
        await check.test();
        log(`   ✅ ${check.name}`, 'green');
        passedChecks++;
      } catch (error) {
        log(`   ❌ ${check.name}: ${error.message}`, 'red');
      }
    }

    log(`\n📊 Salud de la base de datos: ${passedChecks}/${checks.length} checks pasaron`,
        passedChecks === checks.length ? 'green' : 'yellow');

  } catch (error) {
    log(`❌ Error verificando salud: ${error.message}`, 'red');
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);

  log('🛠️  Vendly Checkout - Utilidades de Base de Datos', 'blue');
  log('=' * 50, 'blue');

  const command = args[0];
  
  if (command === 'stats' || args.includes('--stats')) {
    await showDatabaseStats();
  } else if (command === 'recent' || args.includes('--recent')) {
    const limit = args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || 5;
    await showRecentProducts(parseInt(limit));
  } else if (command === 'categories' || args.includes('--categories')) {
    await showTopCategories();
  } else if (command === 'health' || args.includes('--health')) {
    await checkDatabaseHealth();
  } else {
    log('\n📋 Comandos disponibles:', 'cyan');
    log('  npm run utils:stats       - Estadísticas completas');
    log('  npm run utils:recent      - Productos recientes');
    log('  npm run utils:categories  - Info de categorías');
    log('  npm run utils:health      - Estado de salud\n');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    log(`❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  showDatabaseStats,
  showRecentProducts,
  showTopCategories,
  checkDatabaseHealth
};
