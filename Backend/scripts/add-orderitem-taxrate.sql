-- MwSt-Snapshot pro Bestellposition (Verkaufszeitpunkt).
-- Nach Ausführung: neue OrderItems speichern taxRate; Rechnungen nutzen COALESCE(oi."taxRate", p."taxRate").
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "taxRate" NUMERIC(10, 6);

COMMENT ON COLUMN "OrderItem"."taxRate" IS 'Schweizer MwSt-Satz zum Verkaufszeitpunkt als Dezimal (0, 0.026, 0.081).';
