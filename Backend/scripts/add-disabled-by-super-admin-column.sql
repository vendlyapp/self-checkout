-- Agregar columna disabledBySuperAdmin a la tabla PaymentMethod
-- Este campo permite que el super admin inhabilite métodos de pago,
-- impidiendo que los usuarios los configuren o usen

ALTER TABLE "PaymentMethod" 
ADD COLUMN IF NOT EXISTS "disabledBySuperAdmin" BOOLEAN DEFAULT false NOT NULL;

-- Crear índice para mejorar las consultas de filtrado
CREATE INDEX IF NOT EXISTS "idx_PaymentMethod_disabledBySuperAdmin" 
ON "PaymentMethod" ("disabledBySuperAdmin");

-- Comentario para documentar el campo
COMMENT ON COLUMN "PaymentMethod"."disabledBySuperAdmin" IS 
'Si es true, el método de pago fue inhabilitado por el super admin. Los usuarios no pueden configurarlo ni usarlo. Solo el super admin puede volver a habilitarlo.';

