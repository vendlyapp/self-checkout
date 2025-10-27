-- Migración: Agregar campo isOpen a la tabla Store
-- Este campo permite controlar si la tienda está abierta o cerrada para recibir pedidos

-- 1. Agregar columna isOpen a Store
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "isOpen" BOOLEAN DEFAULT true;

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS "idx_store_isopen" ON "Store"("isOpen");

-- 3. Comentario en la columna
COMMENT ON COLUMN "Store"."isOpen" IS 'Indica si la tienda está abierta para recibir pedidos (true) o cerrada (false)';

COMMIT;

