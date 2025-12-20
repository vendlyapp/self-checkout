-- Crear tabla DiscountCode para códigos promocionales
-- Esta tabla almacena los códigos de descuento que pueden ser aplicados a las órdenes

-- Verificar si la tabla ya existe antes de crearla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'DiscountCode'
    ) THEN
        -- Crear la tabla DiscountCode
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
            
            -- Constraints adicionales
            CONSTRAINT check_redemptions_limit CHECK (current_redemptions <= max_redemptions),
            CONSTRAINT check_valid_dates CHECK (valid_until IS NULL OR valid_until > valid_from),
            CONSTRAINT check_discount_percentage CHECK (
                (discount_type = 'percentage' AND discount_value <= 100) OR
                (discount_type = 'fixed')
            )
        );
        
        -- Crear índices para mejorar el rendimiento
        CREATE INDEX IF NOT EXISTS "idx_DiscountCode_code" ON "DiscountCode"("code");
        CREATE INDEX IF NOT EXISTS "idx_DiscountCode_owner_id" ON "DiscountCode"("owner_id");
        CREATE INDEX IF NOT EXISTS "idx_DiscountCode_valid_dates" ON "DiscountCode"("valid_from", "valid_until");
        CREATE INDEX IF NOT EXISTS "idx_DiscountCode_is_active" ON "DiscountCode"("is_active");
        CREATE INDEX IF NOT EXISTS "idx_DiscountCode_created_at" ON "DiscountCode"("created_at");
        
        -- Crear función para actualizar updated_at automáticamente
        CREATE OR REPLACE FUNCTION update_discount_code_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Crear trigger para actualizar updated_at
        CREATE TRIGGER trigger_update_discount_code_updated_at
        BEFORE UPDATE ON "DiscountCode"
        FOR EACH ROW
        EXECUTE FUNCTION update_discount_code_updated_at();
        
        RAISE NOTICE 'Tabla DiscountCode creada exitosamente';
    ELSE
        RAISE NOTICE 'La tabla DiscountCode ya existe';
    END IF;
END $$;

