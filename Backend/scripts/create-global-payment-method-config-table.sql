-- Crear tabla para configuraciones globales de métodos de pago
-- Permite inhabilitar métodos de pago a nivel de plataforma

CREATE TABLE IF NOT EXISTS "GlobalPaymentMethodConfig" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL UNIQUE,
    "disabledGlobally" BOOLEAN NOT NULL DEFAULT FALSE,
    "reason" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX IF NOT EXISTS "idx_GlobalPaymentMethodConfig_code" ON "GlobalPaymentMethodConfig" ("code");
CREATE INDEX IF NOT EXISTS "idx_GlobalPaymentMethodConfig_disabledGlobally" ON "GlobalPaymentMethodConfig" ("disabledGlobally");

-- Comentarios para documentación
COMMENT ON TABLE "GlobalPaymentMethodConfig" IS 'Configuraciones globales de métodos de pago. Cuando disabledGlobally es true, el método no está disponible para ninguna tienda.';
COMMENT ON COLUMN "GlobalPaymentMethodConfig"."code" IS 'Código del método de pago (ej: twint, qr-rechnung, etc.)';
COMMENT ON COLUMN "GlobalPaymentMethodConfig"."disabledGlobally" IS 'Si es true, el método está inhabilitado para todas las tiendas';
COMMENT ON COLUMN "GlobalPaymentMethodConfig"."reason" IS 'Motivo de la inhabilitación (opcional, para registro)';

