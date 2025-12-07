-- Script para agregar campos adicionales a la tabla Store
-- Ejecutar este script en la base de datos si los campos no existen

-- Agregar campo address (dirección)
ALTER TABLE "Store" 
ADD COLUMN IF NOT EXISTS "address" TEXT;

-- Agregar campo phone (teléfono)
ALTER TABLE "Store" 
ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- Agregar campo email (correo electrónico)
ALTER TABLE "Store" 
ADD COLUMN IF NOT EXISTS "email" TEXT;

-- Agregar campo description (descripción)
ALTER TABLE "Store" 
ADD COLUMN IF NOT EXISTS "description" TEXT;

-- Verificar que los campos se agregaron correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Store'
  AND column_name IN ('address', 'phone', 'email', 'description')
ORDER BY column_name;

