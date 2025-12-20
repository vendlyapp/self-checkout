const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Ejecutando migración para crear tabla DiscountCode...');
    
    // Verificar si la tabla ya existe
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'DiscountCode'
      )
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('⚠️  La tabla DiscountCode ya existe');
      return;
    }
    
    // Crear la tabla
    await client.query(`
      CREATE TABLE "DiscountCode" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
        discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
        max_redemptions INTEGER NOT NULL DEFAULT 100 CHECK (max_redemptions > 0),
        current_redemptions INTEGER NOT NULL DEFAULT 0 CHECK (current_redemptions >= 0),
        valid_from TIMESTAMP NOT NULL,
        valid_until TIMESTAMP NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        owner_id UUID NOT NULL,
        
        CONSTRAINT check_redemptions_limit CHECK (current_redemptions <= max_redemptions),
        CONSTRAINT check_valid_dates CHECK (valid_until IS NULL OR valid_until > valid_from),
        CONSTRAINT check_discount_percentage CHECK (
          (discount_type = 'percentage' AND discount_value <= 100) OR
          (discount_type = 'fixed')
        )
      )
    `);
    
    // Crear índices
    await client.query('CREATE INDEX IF NOT EXISTS "idx_DiscountCode_code" ON "DiscountCode"("code")');
    await client.query('CREATE INDEX IF NOT EXISTS "idx_DiscountCode_owner_id" ON "DiscountCode"("owner_id")');
    await client.query('CREATE INDEX IF NOT EXISTS "idx_DiscountCode_valid_dates" ON "DiscountCode"("valid_from", "valid_until")');
    await client.query('CREATE INDEX IF NOT EXISTS "idx_DiscountCode_is_active" ON "DiscountCode"("is_active")');
    await client.query('CREATE INDEX IF NOT EXISTS "idx_DiscountCode_created_at" ON "DiscountCode"("created_at")');
    
    // Crear función para actualizar updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_discount_code_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    
    // Crear trigger
    await client.query(`
      CREATE TRIGGER trigger_update_discount_code_updated_at
      BEFORE UPDATE ON "DiscountCode"
      FOR EACH ROW
      EXECUTE FUNCTION update_discount_code_updated_at()
    `);
    
    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();

