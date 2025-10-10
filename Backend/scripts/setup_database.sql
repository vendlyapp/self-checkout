-- Script para crear la base de datos en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Eliminar tablas existentes si existen
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "ProductCategory" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 2. Eliminar tipos/enums existentes
DROP TYPE IF EXISTS "UserRole" CASCADE;

-- 3. Crear tipos/enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CUSTOMER');

-- 4. Crear tabla de usuarios
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Crear tabla de categorías de productos
CREATE TABLE "ProductCategory" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "count" INTEGER DEFAULT 0,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Crear tabla de productos (optimizada)
CREATE TABLE "Product" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "originalPrice" DECIMAL(10,2),
    "category" TEXT NOT NULL,
    "categoryId" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 999,
    "initialStock" INTEGER,
    "barcode" TEXT,
    "sku" TEXT,
    "qrCode" TEXT,
    "tags" TEXT[],
    "isNew" BOOLEAN DEFAULT false,
    "isPopular" BOOLEAN DEFAULT false,
    "isOnSale" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    "rating" DECIMAL(3,2),
    "reviews" INTEGER DEFAULT 0,
    "weight" DECIMAL(8,3),
    "hasWeight" BOOLEAN DEFAULT false,
    "dimensions" JSONB,
    "discountPercentage" INTEGER,
    "image" TEXT,
    "images" TEXT[],
    "currency" TEXT DEFAULT 'CHF',
    "promotionTitle" TEXT,
    "promotionType" TEXT,
    "promotionStartAt" TIMESTAMP(3),
    "promotionEndAt" TIMESTAMP(3),
    "promotionBadge" TEXT,
    "promotionActionLabel" TEXT,
    "promotionPriority" INTEGER,
    "supplier" TEXT,
    "costPrice" DECIMAL(10,2),
    "margin" DECIMAL(5,2),
    "taxRate" DECIMAL(5,2),
    "expiryDate" TIMESTAMP(3),
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Crear tabla de órdenes
CREATE TABLE "Order" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 8. Crear tabla de items de órdenes
CREATE TABLE "OrderItem" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

-- 9. Crear índices para mejor rendimiento
CREATE INDEX "idx_user_email" ON "User"("email");
CREATE INDEX "idx_product_sku" ON "Product"("sku") WHERE "sku" IS NOT NULL;
CREATE INDEX "idx_product_barcode" ON "Product"("barcode") WHERE "barcode" IS NOT NULL;
CREATE INDEX "idx_product_category" ON "Product"("category");
CREATE INDEX "idx_product_active" ON "Product"("isActive");
CREATE INDEX "idx_order_user" ON "Order"("userId");
CREATE INDEX "idx_orderitem_order" ON "OrderItem"("orderId");
CREATE INDEX "idx_orderitem_product" ON "OrderItem"("productId");

-- 10. Insertar datos de ejemplo
INSERT INTO "ProductCategory" ("name", "icon", "color") VALUES
('Brot', '🥖', '#8B4513'),
('Milchprodukte', '🥛', '#87CEEB'),
('Obst & Gemüse', '🥕', '#90EE90'),
('Fleisch', '🥩', '#CD5C5C'),
('Getränke', '🥤', '#4169E1');

-- Insertar usuario admin de ejemplo
INSERT INTO "User" ("email", "password", "name", "role") VALUES
('admin@vendly.ch', '$2b$10$example', 'Admin Vendly', 'ADMIN');

-- Insertar productos de ejemplo
INSERT INTO "Product" ("name", "description", "price", "category", "categoryId", "stock", "sku", "supplier", "location") VALUES
('Pan Blanco', 'Pan blanco fresco del día', 2.50, 'Brot', 'brot', 50, 'PAN-001', 'Panadería Central', 'Estante A1'),
('Leche Entera', 'Leche fresca 1L', 1.80, 'Milchprodukte', 'milchprodukte', 30, 'LEC-001', 'Lácteos Suizos', 'Refrigerador B2'),
('Manzanas', 'Manzanas rojas por kg', 3.20, 'Obst & Gemüse', 'obst_gemuse', 25, 'MAN-001', 'Frutas del Valle', 'Sección C1');

-- 11. Crear función para actualizar updatedAt automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Crear triggers para updatedAt
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON "Product" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_updated_at BEFORE UPDATE ON "Order" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orderitem_updated_at BEFORE UPDATE ON "OrderItem" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_category_updated_at BEFORE UPDATE ON "ProductCategory" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Habilitar RLS (Row Level Security) si es necesario
-- ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;

COMMIT;
