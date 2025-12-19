-- Agregar columna isActive a la tabla ProductCategory
-- Esta columna indica si la categoría está activa (visible para clientes) o inactiva

-- Verificar si la columna ya existe antes de agregarla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'ProductCategory' 
        AND column_name = 'isActive'
    ) THEN
        -- Agregar la columna isActive con valor por defecto true
        ALTER TABLE "ProductCategory" 
        ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
        
        -- Crear un índice para mejorar las consultas por estado
        CREATE INDEX IF NOT EXISTS "idx_ProductCategory_isActive" 
        ON "ProductCategory"("isActive");
        
        RAISE NOTICE 'Columna isActive agregada exitosamente a ProductCategory';
    ELSE
        RAISE NOTICE 'La columna isActive ya existe en ProductCategory';
    END IF;
END $$;

