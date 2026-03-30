-- ============================================================
-- Performance Indexes Migration
-- Run once against your Supabase PostgreSQL database.
-- All indexes use IF NOT EXISTS so it is safe to re-run.
-- ============================================================

-- OrderItem (most-hit table: every order read JOINs here)
CREATE INDEX IF NOT EXISTS idx_orderitem_orderid    ON "OrderItem" ("orderId");
CREATE INDEX IF NOT EXISTS idx_orderitem_productid  ON "OrderItem" ("productId");

-- Product (every store-scoped query filters by ownerId)
CREATE INDEX IF NOT EXISTS idx_product_ownerid      ON "Product" ("ownerId");
CREATE INDEX IF NOT EXISTS idx_product_categoryid   ON "Product" ("categoryId");
CREATE INDEX IF NOT EXISTS idx_product_isactive     ON "Product" ("isActive");

-- Order (filtering, sorting, and customer lookups)
CREATE INDEX IF NOT EXISTS idx_order_userid         ON "Order" ("userId");
CREATE INDEX IF NOT EXISTS idx_order_customerid     ON "Order" ("customerId");
CREATE INDEX IF NOT EXISTS idx_order_storeid        ON "Order" ("storeId");
CREATE INDEX IF NOT EXISTS idx_order_status         ON "Order" ("status");
CREATE INDEX IF NOT EXISTS idx_order_createdat      ON "Order" ("createdAt" DESC);

-- Invoice (public token lookup + store/customer lookups)
CREATE INDEX IF NOT EXISTS idx_invoice_orderid      ON "Invoice" ("orderId");
CREATE INDEX IF NOT EXISTS idx_invoice_storeid      ON "Invoice" ("storeId");
CREATE INDEX IF NOT EXISTS idx_invoice_sharetoken   ON "Invoice" ("shareToken");
CREATE INDEX IF NOT EXISTS idx_invoice_invoicenumber ON "Invoice" ("invoiceNumber");
-- Functional index for case-insensitive email search
CREATE INDEX IF NOT EXISTS idx_invoice_customeremail_lower
  ON "Invoice" (LOWER("customerEmail"));

-- Customer (upsert by store+email is the hot path)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_storeid_email
  ON "Customer" ("storeId", LOWER(email));

-- ProductCategory
CREATE INDEX IF NOT EXISTS idx_productcategory_storeid ON "ProductCategory" ("storeId");

-- ============================================================
-- Composite indexes — cover the most common multi-column filters
-- ============================================================

-- PaymentMethod: almost every fetch is WHERE storeId = $1 AND isActive = true
CREATE INDEX IF NOT EXISTS idx_paymentmethod_storeid_isactive
  ON "PaymentMethod" ("storeId", "isActive");

-- DiscountCode: validation query always filters code + active together
CREATE INDEX IF NOT EXISTS idx_discountcode_code_isactive
  ON "DiscountCode" (code, is_active);

-- Invoice: store invoice list is always ordered by date
CREATE INDEX IF NOT EXISTS idx_invoice_storeid_createdat
  ON "Invoice" ("storeId", "createdAt" DESC);

-- Order: user order history sorted by date (replaces two single-column scans)
CREATE INDEX IF NOT EXISTS idx_order_userid_createdat
  ON "Order" ("userId", "createdAt" DESC);

-- Order: Tagesauswertung / Filter nach Laden + Datum
CREATE INDEX IF NOT EXISTS idx_order_storeid_createdat
  ON "Order" ("storeId", "createdAt" DESC);
