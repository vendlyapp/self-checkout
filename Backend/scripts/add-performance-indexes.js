/**
 * Script para crear indexes de performance en la base de datos.
 * Es seguro correr múltiples veces gracias a IF NOT EXISTS.
 * 
 * Ejecutar: npm run db:indexes
 */

const { query } = require('../lib/database');

const indexes = [
  // ─── OrderItem ────────────────────────────────────────────────────────────
  // La tabla más consultada de toda la app: cada lectura de órdenes hace JOIN aquí
  {
    name: 'idx_orderitem_orderid',
    sql: 'CREATE INDEX IF NOT EXISTS idx_orderitem_orderid ON "OrderItem" ("orderId")',
    description: 'OrderItem.orderId — JOIN en cada lectura de órdenes',
  },
  {
    name: 'idx_orderitem_productid',
    sql: 'CREATE INDEX IF NOT EXISTS idx_orderitem_productid ON "OrderItem" ("productId")',
    description: 'OrderItem.productId — JOIN con Product para filtros por tienda',
  },

  // ─── Product ──────────────────────────────────────────────────────────────
  // Casi todas las queries de tienda filtran por ownerId
  {
    name: 'idx_product_ownerid',
    sql: 'CREATE INDEX IF NOT EXISTS idx_product_ownerid ON "Product" ("ownerId")',
    description: 'Product.ownerId — filtro en todas las queries de tienda',
  },
  {
    name: 'idx_product_categoryid',
    sql: 'CREATE INDEX IF NOT EXISTS idx_product_categoryid ON "Product" ("categoryId")',
    description: 'Product.categoryId — JOIN con categorías',
  },
  {
    name: 'idx_product_isactive',
    sql: 'CREATE INDEX IF NOT EXISTS idx_product_isactive ON "Product" ("isActive")',
    description: 'Product.isActive — filtro de productos disponibles',
  },

  // ─── Order ────────────────────────────────────────────────────────────────
  {
    name: 'idx_order_userid',
    sql: 'CREATE INDEX IF NOT EXISTS idx_order_userid ON "Order" ("userId")',
    description: 'Order.userId — búsqueda de órdenes por usuario',
  },
  {
    name: 'idx_order_customerid',
    sql: 'CREATE INDEX IF NOT EXISTS idx_order_customerid ON "Order" ("customerId")',
    description: 'Order.customerId — vínculo con tabla Customer',
  },
  {
    name: 'idx_order_storeid',
    sql: 'CREATE INDEX IF NOT EXISTS idx_order_storeid ON "Order" ("storeId")',
    description: 'Order.storeId — filtro de órdenes por tienda',
  },
  {
    name: 'idx_order_status',
    sql: 'CREATE INDEX IF NOT EXISTS idx_order_status ON "Order" ("status")',
    description: 'Order.status — filtros WHERE status != cancelled y similares',
  },
  {
    name: 'idx_order_createdat',
    sql: 'CREATE INDEX IF NOT EXISTS idx_order_createdat ON "Order" ("createdAt" DESC)',
    description: 'Order.createdAt DESC — ORDER BY en todas las listas de órdenes',
  },

  // ─── Invoice ──────────────────────────────────────────────────────────────
  {
    name: 'idx_invoice_orderid',
    sql: 'CREATE INDEX IF NOT EXISTS idx_invoice_orderid ON "Invoice" ("orderId")',
    description: 'Invoice.orderId — lookup de factura por orden',
  },
  {
    name: 'idx_invoice_storeid',
    sql: 'CREATE INDEX IF NOT EXISTS idx_invoice_storeid ON "Invoice" ("storeId")',
    description: 'Invoice.storeId — listado de facturas por tienda',
  },
  {
    name: 'idx_invoice_sharetoken',
    sql: 'CREATE INDEX IF NOT EXISTS idx_invoice_sharetoken ON "Invoice" ("shareToken")',
    description: 'Invoice.shareToken — lookup público de facturas sin auth',
  },
  {
    name: 'idx_invoice_invoicenumber',
    sql: 'CREATE INDEX IF NOT EXISTS idx_invoice_invoicenumber ON "Invoice" ("invoiceNumber")',
    description: 'Invoice.invoiceNumber — búsqueda por número de factura',
  },
  {
    name: 'idx_invoice_customeremail_lower',
    sql: 'CREATE INDEX IF NOT EXISTS idx_invoice_customeremail_lower ON "Invoice" (LOWER("customerEmail"))',
    description: 'Invoice.customerEmail (funcional) — búsqueda case-insensitive',
  },

  // ─── Customer ─────────────────────────────────────────────────────────────
  {
    name: 'idx_customer_storeid_email',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_storeid_email
          ON "Customer" ("storeId", LOWER(email))`,
    description: 'Customer.(storeId, email) — upsert por tienda+email (hot path del checkout)',
  },

  // ─── ProductCategory ──────────────────────────────────────────────────────
  {
    name: 'idx_productcategory_storeid',
    sql: 'CREATE INDEX IF NOT EXISTS idx_productcategory_storeid ON "ProductCategory" ("storeId")',
    description: 'ProductCategory.storeId — categorías por tienda',
  },

  // ─── Composite indexes ────────────────────────────────────────────────────
  // Cubren los filtros multi-columna más frecuentes, evitando que Postgres
  // combine dos índices simples (bitmap AND) cuando puede usar uno solo.
  {
    name: 'idx_paymentmethod_storeid_isactive',
    sql: 'CREATE INDEX IF NOT EXISTS idx_paymentmethod_storeid_isactive ON "PaymentMethod" ("storeId", "isActive")',
    description: 'PaymentMethod.(storeId, isActive) — fetch de métodos activos por tienda',
  },
  {
    name: 'idx_discountcode_code_isactive',
    sql: 'CREATE INDEX IF NOT EXISTS idx_discountcode_code_isactive ON "DiscountCode" (code, is_active)',
    description: 'DiscountCode.(code, is_active) — validación de cupón (hot path del checkout)',
  },
  {
    name: 'idx_invoice_storeid_createdat',
    sql: 'CREATE INDEX IF NOT EXISTS idx_invoice_storeid_createdat ON "Invoice" ("storeId", "createdAt" DESC)',
    description: 'Invoice.(storeId, createdAt DESC) — listado de facturas por tienda ordenado por fecha',
  },
  {
    name: 'idx_order_userid_createdat',
    sql: 'CREATE INDEX IF NOT EXISTS idx_order_userid_createdat ON "Order" ("userId", "createdAt" DESC)',
    description: 'Order.(userId, createdAt DESC) — historial de órdenes por usuario ordenado por fecha',
  },
  {
    name: 'idx_order_storeid_createdat',
    sql: 'CREATE INDEX IF NOT EXISTS idx_order_storeid_createdat ON "Order" ("storeId", "createdAt" DESC)',
    description: 'Order.(storeId, createdAt DESC) — Kunden-heute / Listen nach Tag',
  },

  // ─── Additional indexes (T2 optimization) ──────────────────────────────────
  {
    name: 'idx_discountcode_owner_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_discountcode_owner_id ON "DiscountCode" ("owner_id")',
    description: 'DiscountCode.owner_id — filtro por tienda en listado y validación',
  },
  {
    name: 'idx_notification_storeid_createdat',
    sql: 'CREATE INDEX IF NOT EXISTS idx_notification_storeid_createdat ON "Notification" ("storeId", "createdAt" DESC)',
    description: 'Notification.(storeId, createdAt DESC) — listado de notificaciones por tienda ordenado',
  },
  {
    name: 'idx_product_ownerid_isactive',
    sql: 'CREATE INDEX IF NOT EXISTS idx_product_ownerid_isactive ON "Product" ("ownerId", "isActive")',
    description: 'Product.(ownerId, isActive) — hot path: tienda + activos (composite)',
  },
  {
    name: 'idx_order_storeid_status',
    sql: 'CREATE INDEX IF NOT EXISTS idx_order_storeid_status ON "Order" ("storeId", "status")',
    description: 'Order.(storeId, status) — filtros por tienda + status (órdenes pendientes, etc)',
  },
];

async function addPerformanceIndexes() {
  console.log('🚀 Iniciando creación de indexes de performance...\n');

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const index of indexes) {
    try {
      await query(index.sql);
      console.log(`  ✅ ${index.name}`);
      console.log(`     └─ ${index.description}`);
      created++;
    } catch (error) {
      // IF NOT EXISTS evita casi todos los errores; solo fallaría si hay un problema real
      if (error.message && error.message.includes('already exists')) {
        console.log(`  ⚠️  ${index.name} — ya existe, omitiendo`);
        skipped++;
      } else {
        console.error(`  ❌ ${index.name} — ERROR: ${error.message}`);
        failed++;
      }
    }
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`  Resumen:`);
  console.log(`  ✅ Creados/confirmados : ${created}`);
  if (skipped > 0) console.log(`  ⚠️  Ya existían       : ${skipped}`);
  if (failed > 0)  console.log(`  ❌ Fallidos           : ${failed}`);
  console.log('─────────────────────────────────────────\n');

  if (failed > 0) {
    throw new Error(`${failed} index(es) fallaron. Revisa los errores arriba.`);
  }

  console.log('✅ Todos los indexes de performance están activos.');
}

if (require.main === module) {
  addPerformanceIndexes()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { addPerformanceIndexes };
