-- IVA/MwSt suizo como fracción decimal: 2.6 % = 0.026 (tres decimales significativos).
-- Si "taxRate" en Product está como NUMERIC(p, 2) u otro tipo con pocos decimales,
-- PostgreSQL REDONDEA 0.026 → 0.03 al guardar. La app muestra 2.6 % porque normaliza
-- 0.03 de vuelta a 0.026 al leer, pero en SQL sigues viendo 0.03.
--
-- Ejecutar una vez en Supabase / Postgres (SQL editor).

ALTER TABLE "Product"
  ALTER COLUMN "taxRate" TYPE NUMERIC(10, 6)
  USING ("taxRate"::numeric);

-- Opcional: corregir filas ya redondeadas a 0.03 (equivale a tasa reducida 2.6 %)
UPDATE "Product"
SET "taxRate" = 0.026
WHERE "taxRate" IS NOT NULL
  AND "taxRate"::numeric >= 0.029
  AND "taxRate"::numeric <= 0.031;

COMMENT ON COLUMN "Product"."taxRate" IS 'MwSt/IVA: 0, 0.026 (2.6%), 0.081 (8.1%) — guardar con al menos 6 decimales.';
