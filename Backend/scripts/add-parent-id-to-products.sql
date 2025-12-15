-- Script para agregar el campo parentId a la tabla Product
-- Este campo permite que un producto tenga variantes (productos hijos)

-- Agregar la columna parentId si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Product' 
        AND column_name = 'parentId'
    ) THEN
        -- El campo id en Product es TEXT, no UUID, por lo que parentId también debe ser TEXT
        ALTER TABLE "Product" 
        ADD COLUMN "parentId" TEXT REFERENCES "Product"("id") ON DELETE CASCADE;
        
        -- Crear índice para mejorar las consultas de productos hijos
        CREATE INDEX IF NOT EXISTS "idx_product_parent_id" ON "Product"("parentId");
        
        -- Agregar comentario a la columna
        COMMENT ON COLUMN "Product"."parentId" IS 'ID del producto padre. Si es NULL, es un producto principal. Si tiene valor, es una variante del producto padre.';
    END IF;
END $$;

