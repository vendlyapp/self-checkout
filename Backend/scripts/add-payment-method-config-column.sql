-- Agregar columna config (JSONB) a la tabla PaymentMethod para almacenar configuraciones
-- Esta columna almacena las configuraciones específicas de cada método de pago (API keys, secrets, etc.)

DO $$
BEGIN
    -- Verificar si la columna ya existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'PaymentMethod'
        AND column_name = 'config'
    ) THEN
        -- Agregar columna config
        ALTER TABLE "PaymentMethod" 
        ADD COLUMN config JSONB DEFAULT NULL;
        
        -- Crear índice GIN para búsquedas eficientes en JSONB
        CREATE INDEX IF NOT EXISTS "idx_PaymentMethod_config" ON "PaymentMethod" USING GIN (config);
        
        RAISE NOTICE 'Columna config agregada exitosamente a la tabla PaymentMethod';
    ELSE
        RAISE NOTICE 'La columna config ya existe en la tabla PaymentMethod';
    END IF;
END $$;

