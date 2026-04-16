/**
 * Swiss VAT (MwSt) — nur drei Sätze: 0, 2.6%, 8.1% (als Dezimal 0, 0.026, 0.081).
 * Akzeptiert DB-Dezimal oder Prozent-Eingabe (2.6, 8.1, 0). Kein 3.8%-Satz.
 */

const KNOWN = [0, 0.026, 0.081];

function snapToKnown(dec) {
  if (!Number.isFinite(dec)) return 0.026;
  if (dec === 0) return 0;
  let best = dec;
  let bestD = Infinity;
  for (const k of KNOWN) {
    if (k === 0) continue;
    const d = Math.abs(dec - k);
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  }
  if (Math.abs(dec - 0.03) < 0.0005) return 0.026;
  if (Math.abs(dec - 0.038) < 0.0005) return 0.026;
  if (bestD < 0.002) return best;
  return Math.round(dec * 10000) / 10000;
}

/**
 * @param {unknown} raw — from Product.taxRate or invoice item metadata
 * @returns {number} 0 | 0.026 | 0.081
 */
function normalizeSwissMwStRate(raw) {
  if (raw === null || raw === undefined || raw === '') return 0.026;
  const n = typeof raw === 'string' ? parseFloat(String(raw).replace(',', '.')) : Number(raw);
  if (!Number.isFinite(n)) return 0.026;

  if (n === 0) return 0;

  // Already decimal fraction (0.026, 0.081, …)
  if (n > 0 && n <= 0.2) {
    if (n >= 0.0795 && n <= 0.0815) return 0.081;
    if (Math.abs(n - 0.026) < 0.0005) return 0.026;
    if (Math.abs(n - 0.038) < 0.0005) return 0.026;
    if (n < 0.001) return 0;
    return snapToKnown(n);
  }

  // Percent-style: 2.6, 8.1, 3.8, 26 mistaken as 26% → 0.26 still > 0.2
  if (n > 0.2 && n <= 100) {
    return normalizeSwissMwStRate(n / 100);
  }

  return 0.026;
}

/** Swiss-style letter for grouping (not official QR code letters for all). */
function mwstCodeForSwissRate(rate) {
  const r = normalizeSwissMwStRate(rate);
  if (r === 0) return 'Z';
  if (Math.abs(r - 0.081) < 0.0005) return 'A';
  if (Math.abs(r - 0.026) < 0.0005) return 'B';
  return 'B';
}

module.exports = {
  normalizeSwissMwStRate,
  mwstCodeForSwissRate,
};
