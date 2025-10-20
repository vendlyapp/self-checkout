-- Migración: Sistema Multi-Tenant
-- Cada administrador tiene su propia tienda con sus propios productos

-- 1. Crear tabla Store
CREATE TABLE IF NOT EXISTS "Store" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "ownerId" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "logo" TEXT,
    "qrCode" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 2. Agregar índices
CREATE INDEX "idx_store_slug" ON "Store"("slug");
CREATE INDEX "idx_store_owner" ON "Store"("ownerId");

-- 3. Agregar ownerId a Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "ownerId" TEXT;

-- 4. Crear foreign key
ALTER TABLE "Product" ADD CONSTRAINT "fk_product_owner" 
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE;

-- 5. Crear índice para productos por owner
CREATE INDEX "idx_product_owner" ON "Product"("ownerId");

-- 6. Trigger para Store updatedAt
CREATE TRIGGER update_store_updated_at 
    BEFORE UPDATE ON "Store" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

