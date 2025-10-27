-- Migration: Add barcodeImage column to Product table
-- Description: Adds a barcodeImage column to store the generated barcode image (similar to qrCode)
-- Author: System
-- Date: 2024

-- Add barcodeImage column to Product table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Product' AND column_name='barcodeImage') THEN
        ALTER TABLE "Product" ADD COLUMN "barcodeImage" TEXT;
        CREATE INDEX "idx_product_barcodeImage" ON "Product"("barcodeImage") WHERE "barcodeImage" IS NOT NULL;
        RAISE NOTICE 'Column barcodeImage added successfully';
    ELSE
        RAISE NOTICE 'Column barcodeImage already exists';
    END IF;
END $$;

