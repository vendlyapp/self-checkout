/**
 * Script para crear la tabla Notification
 * Notificaciones por tienda (nueva orden, orden cancelada, etc.)
 * Ejecutar: node scripts/create-notifications-table.js
 */

const { query } = require('../lib/database');

async function createNotificationsTable() {
  try {
    console.log('📦 Creando tabla Notification...');

    const checkTable = await query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Notification'
      )
    `);

    if (checkTable.rows[0].exists) {
      console.log('⚠️  La tabla Notification ya existe');
      return;
    }

    await query(`
      CREATE TABLE "Notification" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
        "storeId" TEXT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "payload" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_Notification_storeId"
          FOREIGN KEY ("storeId")
          REFERENCES "Store"(id)
          ON DELETE CASCADE
      )
    `);

    console.log('✅ Tabla Notification creada');

    await query(`
      CREATE INDEX "idx_Notification_storeId_createdAt" ON "Notification"("storeId", "createdAt" DESC)
    `);
    await query(`
      CREATE INDEX "idx_Notification_storeId_read" ON "Notification"("storeId", "read")
    `);

    console.log('✅ Índices creados');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

createNotificationsTable()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
