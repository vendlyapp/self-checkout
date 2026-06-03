-- Consolidated performance indexes (from Backend/src/migrations/)
-- Idempotent: CREATE INDEX IF NOT EXISTS

CREATE INDEX IF NOT EXISTS idx_orderitem_orderid ON "OrderItem" ("orderId");
CREATE INDEX IF NOT EXISTS idx_orderitem_productid ON "OrderItem" ("productId");
CREATE INDEX IF NOT EXISTS idx_product_ownerid ON "Product" ("ownerId");
CREATE INDEX IF NOT EXISTS idx_product_categoryid ON "Product" ("categoryId");
CREATE INDEX IF NOT EXISTS idx_product_owner_active ON "Product" ("ownerId", "isActive");
CREATE INDEX IF NOT EXISTS idx_order_storeid ON "Order" ("storeId");
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order" ("status");
CREATE INDEX IF NOT EXISTS idx_order_createdat ON "Order" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_storeid ON "Invoice" ("storeId");
CREATE INDEX IF NOT EXISTS idx_invoice_sharetoken ON "Invoice" ("shareToken");
CREATE INDEX IF NOT EXISTS idx_customer_store_email ON "Customer" ("storeId", LOWER(email));
CREATE INDEX IF NOT EXISTS idx_productcategory_storeid ON "ProductCategory" ("storeId");
CREATE INDEX IF NOT EXISTS idx_paymentmethod_store_active ON "PaymentMethod" ("storeId", "isActive");
CREATE INDEX IF NOT EXISTS idx_notification_store_created ON "Notification" ("storeId", "createdAt" DESC);
