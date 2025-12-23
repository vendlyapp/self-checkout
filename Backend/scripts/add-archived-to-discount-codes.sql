-- Agregar campo archived a la tabla DiscountCode
-- Este campo permite archivar códigos en lugar de eliminarlos

DO $$
BEGIN
    -- Verificar si la columna ya existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'DiscountCode'
        AND column_name = 'archived'
    ) THEN
        -- Agregar la columna archived
        ALTER TABLE "DiscountCode" 
        ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;
        
        -- Crear índice para mejorar el rendimiento de consultas
        CREATE INDEX IF NOT EXISTS "idx_DiscountCode_archived" ON "DiscountCode"("archived");
        
        RAISE NOTICE 'Columna archived agregada exitosamente a la tabla DiscountCode';
    ELSE
        RAISE NOTICE 'La columna archived ya existe en la tabla DiscountCode';
    END IF;
END $$;

