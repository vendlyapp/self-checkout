-- Activar Bargeld (efectivo) por defecto en todos los stores
-- Este script asegura que el método de pago Bargeld esté activo para todas las tiendas
-- Bargeld siempre debe estar activo y no requiere configuración

-- Activar todos los métodos Bargeld
UPDATE "PaymentMethod"
SET 
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE LOWER(code) = 'bargeld';

-- Verificar cuántos métodos Bargeld están activos
SELECT 
  COUNT(*) as total_bargeld,
  COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_bargeld,
  COUNT(CASE WHEN "isActive" = false THEN 1 END) as inactive_bargeld,
  'Bargeld status check' as message
FROM "PaymentMethod"
WHERE LOWER(code) = 'bargeld';

