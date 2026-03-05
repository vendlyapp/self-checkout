-- ============================================================
-- pg_trgm GIN indexes for fast ILIKE text search
-- Run once in Supabase SQL Editor.
-- After this, ILIKE '%term%' on these columns uses an index
-- scan instead of a full sequential scan.
-- ============================================================

-- Enable the trigram extension (already available in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Product: columns used in search()
CREATE INDEX IF NOT EXISTS idx_product_name_trgm
  ON "Product" USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_product_sku_trgm
  ON "Product" USING GIN (sku gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_product_category_trgm
  ON "Product" USING GIN (category gin_trgm_ops);

-- Customer: columns used in getByStoreId() search
CREATE INDEX IF NOT EXISTS idx_customer_name_trgm
  ON "Customer" USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_customer_email_trgm
  ON "Customer" USING GIN (email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_customer_phone_trgm
  ON "Customer" USING GIN (phone gin_trgm_ops);
