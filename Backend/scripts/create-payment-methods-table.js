const { query } = require('../lib/database');

/**
 * Script para crear la tabla PaymentMethod e inicializar métodos de pago para todos los stores existentes
 */
async function createPaymentMethodsTable() {
  try {
    console.log('📦 Creando tabla PaymentMethod...');
    
    // Verificar si la tabla ya existe
    const checkTable = await query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'PaymentMethod'
      )
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('⚠️  La tabla PaymentMethod ya existe');
      // Continuar con la inicialización de métodos de pago
      await initializePaymentMethodsForAllStores();
      return;
    }
    
    // Crear la tabla
    await query(`
      CREATE TABLE "PaymentMethod" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "storeId" TEXT NOT NULL,
        name TEXT NOT NULL,
        "displayName" TEXT NOT NULL,
        code TEXT NOT NULL,
        icon TEXT,
        "bgColor" TEXT,
        "textColor" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT unique_store_code UNIQUE ("storeId", code),
        
        CONSTRAINT fk_payment_method_store 
          FOREIGN KEY ("storeId") 
          REFERENCES "Store"(id) 
          ON DELETE CASCADE
      )
    `);
    
    // Crear índices
    await query('CREATE INDEX IF NOT EXISTS "idx_PaymentMethod_storeId" ON "PaymentMethod"("storeId")');
    await query('CREATE INDEX IF NOT EXISTS "idx_PaymentMethod_isActive" ON "PaymentMethod"("isActive")');
    await query('CREATE INDEX IF NOT EXISTS "idx_PaymentMethod_storeId_isActive" ON "PaymentMethod"("storeId", "isActive")');
    await query('CREATE INDEX IF NOT EXISTS "idx_PaymentMethod_sortOrder" ON "PaymentMethod"("storeId", "sortOrder")');
    
    // Crear función para actualizar updatedAt
    await query(`
      CREATE OR REPLACE FUNCTION update_payment_method_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    
    // Crear trigger
    await query(`
      CREATE TRIGGER trigger_update_payment_method_updated_at
      BEFORE UPDATE ON "PaymentMethod"
      FOR EACH ROW
      EXECUTE FUNCTION update_payment_method_updated_at()
    `);
    
    console.log('✅ Tabla PaymentMethod creada exitosamente');
    
    // Inicializar métodos de pago para todos los stores existentes
    await initializePaymentMethodsForAllStores();
    
    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  }
}

/**
 * Inicializa los métodos de pago predeterminados para todos los stores existentes
 */
async function initializePaymentMethodsForAllStores() {
  try {
    // Obtener todos los stores
    const storesResult = await query('SELECT id FROM "Store"');
    const stores = storesResult.rows;
    
    if (stores.length === 0) {
      console.log('⚠️  No hay stores existentes para inicializar métodos de pago');
      return;
    }
    
    console.log(`📝 Inicializando métodos de pago para ${stores.length} store(s)...`);
    
    // Métodos de pago iniciales (activos)
    const activeMethods = [
      {
        name: 'TWINT',
        displayName: 'TWINT',
        code: 'twint',
        icon: '/logo-twint.svg',
        bgColor: '#25D076',
        textColor: '#FFFFFF',
        sortOrder: 1,
        isActive: true
      },
      {
        name: 'QR Rechnung',
        displayName: 'QR Rechnung',
        code: 'qr-rechnung',
        icon: '/qr.svg',
        bgColor: '#F2AD00',
        textColor: '#FFFFFF',
        sortOrder: 2,
        isActive: true
      },
      {
        name: 'Bargeld',
        displayName: 'Bargeld',
        code: 'bargeld',
        icon: 'Coins',
        bgColor: '#766B6A',
        textColor: '#FFFFFF',
        sortOrder: 3,
        isActive: true
      }
    ];
    
    // Métodos de pago inactivos
    const inactiveMethods = [
      {
        name: 'Debit-, Kreditkarte',
        displayName: 'Debit-, Kreditkarte',
        code: 'debit-credit',
        icon: '/card.svg',
        bgColor: '#6E7996',
        textColor: '#FFFFFF',
        sortOrder: 4,
        isActive: false
      },
      {
        name: 'PostFinance',
        displayName: 'PostFinance',
        code: 'postfinance',
        icon: '/pay.svg',
        bgColor: '#F2AD00',
        textColor: '#FFFFFF',
        sortOrder: 5,
        isActive: false
      },
      {
        name: 'Klarna',
        displayName: 'Klarna',
        code: 'klarna',
        icon: '/Klarna.svg',
        bgColor: '#F4B6C7',
        textColor: '#17120F',
        sortOrder: 6,
        isActive: false
      }
    ];
    
    const allMethods = [...activeMethods, ...inactiveMethods];
    
    // Para cada store, crear los métodos de pago si no existen
    for (const store of stores) {
      for (const method of allMethods) {
        // Verificar si el método ya existe para este store
        const existingMethod = await query(
          'SELECT id FROM "PaymentMethod" WHERE "storeId" = $1 AND code = $2',
          [store.id, method.code]
        );
        
        if (existingMethod.rows.length === 0) {
          // Crear el método de pago
          await query(
            `INSERT INTO "PaymentMethod" 
             ("storeId", name, "displayName", code, icon, "bgColor", "textColor", "isActive", "sortOrder")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              store.id,
              method.name,
              method.displayName,
              method.code,
              method.icon,
              method.bgColor,
              method.textColor,
              method.isActive,
              method.sortOrder
            ]
          );
        }
      }
    }
    
    console.log(`✅ Métodos de pago inicializados para ${stores.length} store(s)`);
  } catch (error) {
    console.error('❌ Error inicializando métodos de pago:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createPaymentMethodsTable()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { createPaymentMethodsTable, initializePaymentMethodsForAllStores };

