-- Add sales goal columns to Store (Tagesziel, Wochenziel, Monatsziel in CHF)
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "goalDaily" NUMERIC DEFAULT NULL;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "goalWeekly" NUMERIC DEFAULT NULL;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "goalMonthly" NUMERIC DEFAULT NULL;

COMMENT ON COLUMN "Store"."goalDaily" IS 'Daily sales goal in CHF (Tagesziel)';
COMMENT ON COLUMN "Store"."goalWeekly" IS 'Weekly sales goal in CHF (Wochenziel)';
COMMENT ON COLUMN "Store"."goalMonthly" IS 'Monthly sales goal in CHF (Monatsziel)';
