-- Vendly Checkout: Row Level Security (defense in depth)
-- Backend Express uses service role / direct connection; RLS protects direct Supabase client access.
-- Apply with: supabase db push (or run manually in SQL editor)

-- Helper: current authenticated user id from Supabase Auth
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(auth.uid()::text, '');
$$;

-- ─── Product ───────────────────────────────────────────────────────────────
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_select_owner ON "Product";
CREATE POLICY product_select_owner ON "Product"
  FOR SELECT
  USING ("ownerId" = public.current_user_id());

DROP POLICY IF EXISTS product_insert_owner ON "Product";
CREATE POLICY product_insert_owner ON "Product"
  FOR INSERT
  WITH CHECK ("ownerId" = public.current_user_id());

DROP POLICY IF EXISTS product_update_owner ON "Product";
CREATE POLICY product_update_owner ON "Product"
  FOR UPDATE
  USING ("ownerId" = public.current_user_id());

DROP POLICY IF EXISTS product_delete_owner ON "Product";
CREATE POLICY product_delete_owner ON "Product"
  FOR DELETE
  USING ("ownerId" = public.current_user_id());

-- ─── ProductCategory ───────────────────────────────────────────────────────
ALTER TABLE "ProductCategory" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS category_store ON "ProductCategory";
CREATE POLICY category_store ON "ProductCategory"
  FOR ALL
  USING (
    "storeId" IN (SELECT id FROM "Store" WHERE "ownerId" = public.current_user_id())
  )
  WITH CHECK (
    "storeId" IN (SELECT id FROM "Store" WHERE "ownerId" = public.current_user_id())
  );

-- ─── Order ─────────────────────────────────────────────────────────────────
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS order_store ON "Order";
CREATE POLICY order_store ON "Order"
  FOR ALL
  USING (
    "storeId" IN (SELECT id FROM "Store" WHERE "ownerId" = public.current_user_id())
  )
  WITH CHECK (
    "storeId" IN (SELECT id FROM "Store" WHERE "ownerId" = public.current_user_id())
  );

-- ─── Customer ──────────────────────────────────────────────────────────────
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customer_store ON "Customer";
CREATE POLICY customer_store ON "Customer"
  FOR ALL
  USING (
    "storeId" IN (SELECT id FROM "Store" WHERE "ownerId" = public.current_user_id())
  )
  WITH CHECK (
    "storeId" IN (SELECT id FROM "Store" WHERE "ownerId" = public.current_user_id())
  );

-- ─── Invoice ───────────────────────────────────────────────────────────────
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invoice_store ON "Invoice";
CREATE POLICY invoice_store ON "Invoice"
  FOR ALL
  USING (
    "storeId" IN (SELECT id FROM "Store" WHERE "ownerId" = public.current_user_id())
  )
  WITH CHECK (
    "storeId" IN (SELECT id FROM "Store" WHERE "ownerId" = public.current_user_id())
  );

-- ─── PaymentMethod ─────────────────────────────────────────────────────────
ALTER TABLE "PaymentMethod" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payment_method_store ON "PaymentMethod";
CREATE POLICY payment_method_store ON "PaymentMethod"
  FOR ALL
  USING (
    "storeId" IN (SELECT id FROM "Store" WHERE "ownerId" = public.current_user_id())
  )
  WITH CHECK (
    "storeId" IN (SELECT id FROM "Store" WHERE "ownerId" = public.current_user_id())
  );

-- ─── Notification ──────────────────────────────────────────────────────────
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notification_store ON "Notification";
CREATE POLICY notification_store ON "Notification"
  FOR ALL
  USING (
    "storeId" IN (SELECT id FROM "Store" WHERE "ownerId" = public.current_user_id())
  )
  WITH CHECK (
    "storeId" IN (SELECT id FROM "Store" WHERE "ownerId" = public.current_user_id())
  );

-- ─── DiscountCode (owner_id = store owner UUID) ────────────────────────────
ALTER TABLE "DiscountCode" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS discount_owner ON "DiscountCode";
CREATE POLICY discount_owner ON "DiscountCode"
  FOR ALL
  USING (owner_id::text = public.current_user_id())
  WITH CHECK (owner_id::text = public.current_user_id());
