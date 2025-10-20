const { query } = require('../lib/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🚀 Ejecutando migración multi-tenant...\n');

    // Leer archivo de migración
    const migrationPath = path.join(__dirname, 'migrations', '02_add_multi_tenant.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Ejecutar migración
    await query(migrationSQL);

    console.log('✅ Migración ejecutada exitosamente\n');
    console.log('📋 Cambios aplicados:');
    console.log('  - Tabla Store creada');
    console.log('  - Campo ownerId agregado a Product');
    console.log('  - Índices creados');
    console.log('  - Constraints agregados\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    process.exit(1);
  }
}

runMigration();

