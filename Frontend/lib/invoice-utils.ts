// =============================================================================
// Swiss Invoice Utilities — Formatting, VAT Calculations & Types
// Based on Art. 26 MWSTG — Swiss Federal Act on Value Added Tax
// =============================================================================

// ─── Types ───────────────────────────────────────────────────────────────────

/** Valid Swiss MwSt rates since 01.01.2024 */
export type MwStRate = 0.081 | 0.026 | 0.038 | 0.0;

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceParty {
  name: string;
  street?: string;
  zip?: string;
  city?: string;
  country?: string;
  mwstNummer?: string; // CHE-XXX.XXX.XXX MWST
  uid?: string;
  email?: string;
  phone?: string;
  iban?: string;
  bank?: string;
}

export interface InvoiceLineItem {
  id: string | number;
  description: string;
  detail?: string;
  quantity: number;
  unitPrice: number;
  totalBrutto: number;
  mwstRate: number;
  mwstCode: string; // "A", "B", etc.
}

export interface MwStGroup {
  code: string;
  rate: number;
  brutto: number;
  netto: number;
  mwst: number;
}

export interface Invoice {
  id: string;
  nummer: string;
  datum: string;
  leistungsDatum?: string;
  faelligkeitsDatum?: string;
  zahlungsfrist?: number;
  waehrung: string;
  referenz?: string;
  status: InvoiceStatus;
  issuer: InvoiceParty;
  recipient: InvoiceParty;
  items: InvoiceLineItem[];
  notes?: string;
  orderId?: string;
  // Computed or stored totals
  discountAmount?: number;
  totalBrutto?: number;
  totalNetto?: number;
  totalMwst?: number;
  storeLogo?: string;
}

// ─── Formatting ──────────────────────────────────────────────────────────────

/** Format number as Swiss CHF (e.g. "1'234.56") */
export function formatCHF(amount: number): string {
  return new Intl.NumberFormat('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format date as Swiss format (dd.MM.yyyy) */
export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Format MwSt rate as percentage string */
export function formatMwStRate(rate: number): string {
  return (rate * 100).toFixed(1) + '%';
}

/** Get label for MwSt rate */
export function getMwStLabel(rate: number): string {
  if (rate === 0.081) return 'Normalsatz';
  if (rate === 0.026) return 'Reduziert';
  if (rate === 0.038) return 'Beherbergung';
  if (rate === 0) return 'Befreit';
  return formatMwStRate(rate);
}

// ─── VAT Calculations ────────────────────────────────────────────────────────
// Swiss VAT Formula (Art. 26 MWSTG):
// In Switzerland, prices ALREADY include VAT (Brutto)
// 
// CORRECT Swiss formula:
//   Netto = Brutto ÷ (1 + rate)
//   MwSt  = Brutto - Netto
//
// NEVER do: Brutto × rate  ← This is INCORRECT in Switzerland
//
// Example with 8.1% rate and CHF 100:
//   Brutto: 100.00 CHF (what customer pays, already includes VAT)
//   Netto:  100 ÷ 1.081 = 92.51 CHF
//   MwSt:   100 - 92.51 = 7.49 CHF
//   Verification: 92.51 × 0.081 = 7.49 ✓

/** Calculate MwSt breakdown grouped by code using correct Swiss formula */
export function calculateMwStBreakdown(items: InvoiceLineItem[]): MwStGroup[] {
  const groups: Record<string, MwStGroup> = {};

  items.forEach((item) => {
    const key = item.mwstCode;
    if (!groups[key]) {
      groups[key] = {
        code: key,
        rate: item.mwstRate,
        brutto: 0,
        netto: 0,
        mwst: 0,
      };
    }
    // item.totalBrutto already includes VAT (Swiss standard)
    groups[key].brutto += item.totalBrutto;
  });

  return Object.values(groups).map((g) => {
    // Swiss formula: Netto = Brutto ÷ (1 + rate)
    // This extracts VAT from the price, not adds it
    const netto = g.brutto / (1 + g.rate);
    
    // Swiss formula: MwSt = Brutto - Netto
    // This is the correct way to calculate VAT in Switzerland
    return {
      ...g,
      netto,
      mwst: g.brutto - netto,
    };
  });
}

/** Calculate invoice totals using correct Swiss formula */
export function calculateTotals(items: InvoiceLineItem[]) {
  const breakdown = calculateMwStBreakdown(items);
  // totalBrutto is the sum of all item totals (already includes VAT)
  const totalBrutto = items.reduce((sum, item) => sum + item.totalBrutto, 0);
  // totalMwst is calculated correctly in calculateMwStBreakdown using Swiss formula
  const totalMwst = breakdown.reduce((sum, g) => sum + g.mwst, 0);
  // totalNetto = totalBrutto - totalMwst (correct Swiss formula)
  const totalNetto = totalBrutto - totalMwst;

  return { totalBrutto, totalNetto, totalMwst, breakdown };
}

// ─── Status ──────────────────────────────────────────────────────────────────

export interface StatusConfig {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
  ringColor: string;
}

export function getStatusConfig(status: InvoiceStatus): StatusConfig {
  const configs: Record<InvoiceStatus, StatusConfig> = {
    draft: {
      label: 'Entwurf',
      dotColor: 'bg-gray-400',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      ringColor: 'ring-gray-200',
    },
    open: {
      label: 'Ausgestellt',
      dotColor: 'bg-amber-400',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      ringColor: 'ring-amber-200',
    },
    paid: {
      label: 'Bezahlt',
      dotColor: 'bg-emerald-400',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      ringColor: 'ring-emerald-200',
    },
    overdue: {
      label: 'Überfällig',
      dotColor: 'bg-red-400',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      ringColor: 'ring-red-200',
    },
    cancelled: {
      label: 'Storniert',
      dotColor: 'bg-gray-400',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-500',
      ringColor: 'ring-gray-200',
    },
  };
  return configs[status] || configs.open;
}

// ─── Validation ──────────────────────────────────────────────────────────────

/** Validate Swiss MwSt number format */
export function isValidMwStNummer(nummer: string): boolean {
  return /^CHE-\d{3}\.\d{3}\.\d{3}\s*(MWST|TVA|IVA|VAT)$/.test(nummer);
}

/** Check if invoice requires full recipient details (> CHF 400) */
export function requiresFullInvoice(totalBrutto: number): boolean {
  return totalBrutto > 400;
}
