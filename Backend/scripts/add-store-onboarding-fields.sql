-- Campos de onboarding para Store: configuración inicial y flujo de alta
-- settingsCompletedAt: cuando el admin guarda la configuración de la tienda por primera vez
-- onboardingCompletedAt: cuando termina el onboarding (configuración + opcionalmente métodos de pago)

ALTER TABLE "Store"
ADD COLUMN IF NOT EXISTS "settingsCompletedAt" TIMESTAMP WITH TIME ZONE;

ALTER TABLE "Store"
ADD COLUMN IF NOT EXISTS "onboardingCompletedAt" TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN "Store"."settingsCompletedAt" IS 'Primera vez que el admin guardó la configuración de la tienda';
COMMENT ON COLUMN "Store"."onboardingCompletedAt" IS 'Cuando el admin completó el flujo de onboarding (settings + opcional payment methods)';
