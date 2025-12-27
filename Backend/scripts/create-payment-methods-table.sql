-- Crear tabla PaymentMethod para métodos de pago de tiendas
-- Esta tabla almacena los métodos de pago disponibles para cada tienda

-- Verificar si la tabla ya existe antes de crearla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'PaymentMethod'
    ) THEN
        -- Crear la tabla PaymentMethod
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
            
            -- Constraint para asegurar que cada store no tenga códigos duplicados
            CONSTRAINT unique_store_code UNIQUE ("storeId", code),
            
            -- Foreign key a Store
            CONSTRAINT fk_payment_method_store 
                FOREIGN KEY ("storeId") 
                REFERENCES "Store"(id) 
                ON DELETE CASCADE
        );
        
        -- Crear índices para mejorar el rendimiento
        CREATE INDEX IF NOT EXISTS "idx_PaymentMethod_storeId" ON "PaymentMethod"("storeId");
        CREATE INDEX IF NOT EXISTS "idx_PaymentMethod_isActive" ON "PaymentMethod"("isActive");
        CREATE INDEX IF NOT EXISTS "idx_PaymentMethod_storeId_isActive" ON "PaymentMethod"("storeId", "isActive");
        CREATE INDEX IF NOT EXISTS "idx_PaymentMethod_sortOrder" ON "PaymentMethod"("storeId", "sortOrder");
        
        -- Crear función para actualizar updatedAt automáticamente
        CREATE OR REPLACE FUNCTION update_payment_method_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW."updatedAt" = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Crear trigger para actualizar updatedAt
        CREATE TRIGGER trigger_update_payment_method_updated_at
        BEFORE UPDATE ON "PaymentMethod"
        FOR EACH ROW
        EXECUTE FUNCTION update_payment_method_updated_at();
        
        RAISE NOTICE 'Tabla PaymentMethod creada exitosamente';
    ELSE
        RAISE NOTICE 'La tabla PaymentMethod ya existe';
    END IF;
END $$;

