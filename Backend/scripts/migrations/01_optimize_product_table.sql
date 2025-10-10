-- Migración: Optimizar tabla Product para coincidir con el sistema actual
-- Fecha: 2025-10-10
-- Descripción: 
--   1. Remover constraint UNIQUE de qrCode (Data URL muy grande)
--   2. Hacer SKU opcional (se genera automáticamente)
--   3. Ajustar valores por defecto según la lógica actual

BEGIN;

-- 1. Remover constraint UNIQUE de qrCode
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_qrCode_key";
COMMIT;

SELECT '✅ Constraint UNIQUE removido de qrCode' AS status;

BEGIN;

-- 2. Hacer SKU opcional y remover constraint UNIQUE si causa problemas
ALTER TABLE "Product" ALTER COLUMN "sku" DROP NOT NULL;
COMMIT;

SELECT '✅ SKU ahora es opcional (se genera automáticamente)' AS status;

BEGIN;

-- 3. Cambiar valor por defecto de stock a 999
ALTER TABLE "Product" ALTER COLUMN "stock" SET DEFAULT 999;
COMMIT;

SELECT '✅ Stock por defecto cambiado a 999 (ilimitado)' AS status;

BEGIN;

-- 4. Hacer barcode completamente opcional (remover UNIQUE si existe)
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_barcode_key";
COMMIT;

SELECT '✅ Barcode constraint UNIQUE removido (opcional)' AS status;

-- Verificar cambios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'Product'
    AND column_name IN ('sku', 'qrCode', 'stock', 'barcode')
ORDER BY column_name;

SELECT '✅ Migración completada exitosamente' AS final_status;

