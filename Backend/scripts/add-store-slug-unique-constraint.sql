-- Add UNIQUE constraint on Store.slug to enforce one slug per store
-- Run this only if the constraint does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Store_slug_key'
    AND conrelid = '"Store"'::regclass
  ) THEN
    -- First ensure no duplicate slugs exist (should already be enforced in app logic)
    -- If duplicates exist, this will fail and you must resolve them manually
    ALTER TABLE "Store" ADD CONSTRAINT "Store_slug_key" UNIQUE ("slug");
  END IF;
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'Duplicate slugs exist. Resolve duplicates before adding constraint.';
    RAISE;
END $$;
