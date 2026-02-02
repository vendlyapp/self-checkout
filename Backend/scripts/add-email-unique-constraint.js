/**
 * Script para agregar restricción UNIQUE en (storeId, email) a la tabla Customer
 * Esto hace que el email sea la clave única para identificar clientes por tienda
 * Ejecutar: node scripts/add-email-unique-constraint.js
 */

const { query } = require('../lib/database');

async function addEmailUniqueConstraint() {
  try {
    console.log('📦 Agregando restricción UNIQUE en (storeId, email)...');

    // Verificar si la restricción ya existe
    const checkConstraint = await query(`
      SELECT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'unique_customer_store_email'
      )
    `);

    if (checkConstraint.rows[0].exists) {
      console.log('⚠️  La restricción unique_customer_store_email ya existe');
      return;
    }

    // Primero, hacer email NOT NULL si hay clientes sin email, asignarles un email temporal
    console.log('🔧 Verificando clientes sin email...');
    const customersWithoutEmail = await query(`
      SELECT id, "storeId", "name", "phone"
      FROM "Customer"
      WHERE "email" IS NULL OR "email" = ''
    `);

    if (customersWithoutEmail.rows.length > 0) {
      console.log(`⚠️  Encontrados ${customersWithoutEmail.rows.length} clientes sin email`);
      // Asignar emails temporales basados en ID para clientes sin email
      for (const customer of customersWithoutEmail.rows) {
        const tempEmail = `temp_${customer.id}@vendly.local`;
        await query(`
          UPDATE "Customer"
          SET "email" = $1
          WHERE id = $2
        `, [tempEmail, customer.id]);
        console.log(`✅ Email temporal asignado a cliente ${customer.id}: ${tempEmail}`);
      }
    }

    // Limpiar datos duplicados antes de agregar la restricción
    console.log('🧹 Limpiando clientes duplicados...');
    const duplicates = await query(`
      SELECT "storeId", "email", COUNT(*) as count
      FROM "Customer"
      WHERE "email" IS NOT NULL
      GROUP BY "storeId", "email"
      HAVING COUNT(*) > 1
    `);

    if (duplicates.rows.length > 0) {
      console.log(`⚠️  Encontrados ${duplicates.rows.length} grupos de clientes duplicados`);
      
      // Para cada grupo de duplicados, mantener el más reciente y eliminar los demás
      for (const dup of duplicates.rows) {
        const { storeId, email } = dup;
        const customers = await query(`
          SELECT id, "createdAt", "lastPurchaseAt"
          FROM "Customer"
          WHERE "storeId" = $1 AND "email" = $2
          ORDER BY "lastPurchaseAt" DESC, "createdAt" DESC
        `, [storeId, email]);

        if (customers.rows.length > 1) {
          // Mantener el primero (más reciente) y eliminar los demás
          const keepId = customers.rows[0].id;
          const deleteIds = customers.rows.slice(1).map(c => c.id);

          // Mover órdenes de los clientes a eliminar al cliente que se mantiene
          for (const deleteId of deleteIds) {
            await query(`
              UPDATE "Order"
              SET "customerId" = $1
              WHERE "customerId" = $2
            `, [keepId, deleteId]);

            // Eliminar el cliente duplicado
            await query(`
              DELETE FROM "Customer"
              WHERE id = $1
            `, [deleteId]);
          }
          console.log(`✅ Consolidados ${customers.rows.length - 1} clientes duplicados para ${email} en tienda ${storeId}`);
        }
      }
    }

    // Hacer email NOT NULL antes de agregar la restricción UNIQUE
    console.log('🔧 Haciendo email NOT NULL...');
    await query(`
      ALTER TABLE "Customer"
      ALTER COLUMN "email" SET NOT NULL
    `);
    console.log('✅ Columna email ahora es NOT NULL');

    // Agregar restricción UNIQUE en (storeId, email)
    await query(`
      ALTER TABLE "Customer"
      ADD CONSTRAINT "unique_customer_store_email"
      UNIQUE ("storeId", "email")
    `);

    console.log('✅ Restricción UNIQUE agregada en (storeId, email)');

    // Crear índice único si no existe (la restricción UNIQUE ya crea un índice, pero por si acaso)
    const checkIndex = await query(`
      SELECT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE indexname = 'idx_customer_store_email_unique'
      )
    `);

    if (!checkIndex.rows[0].exists) {
      // El índice ya se crea automáticamente con la restricción UNIQUE, pero lo dejamos por compatibilidad
      console.log('✅ Índice único creado automáticamente por la restricción UNIQUE');
    }

    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  }
}

// Ejecutar migración
if (require.main === module) {
  addEmailUniqueConstraint()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { addEmailUniqueConstraint };
