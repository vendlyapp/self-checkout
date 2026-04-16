// =============================================================================
// InvoicePrintView — Layout exclusivo para @media print / PDF
// Diseño basado en factura suiza estándar (estilo Digitec/Galaxus)
// Visible SOLO al imprimir. En pantalla: display:none (via CSS).
// No usa Tailwind responsive — solo clases inv-p-* definidas en globals.css
// =============================================================================

import {
  formatCHF,
  formatDate,
  formatMwStRate,
  normalizeSwissMwStRate,
  type Invoice,
  type MwStGroup,
} from '@/lib/invoice-utils';

interface InvoicePrintViewProps {
  invoice: Invoice;
  totalBrutto: number;
  totalNetto: number;
  totalMwst: number;
  discountAmount: number;
  breakdown: MwStGroup[];
  qrBillSvg: string | null;
}

// ─── Shared page header (logo + store info + website) ────────────────────────
function PageHeader({ invoice }: { invoice: Invoice }) {
  const { issuer } = invoice;
  const website = (issuer as { website?: string }).website;

  return (
    <div className="inv-p-page-header">
      <div className="inv-p-page-header-left">
        {invoice.storeLogo ? (
          <img src={invoice.storeLogo} alt={issuer.name} className="inv-p-logo" />
        ) : (
          <div className="inv-p-logo-mark">{issuer.name?.charAt(0) ?? 'V'}</div>
        )}
        <div className="inv-p-issuer-name">{issuer.name}</div>
        <div className="inv-p-issuer-addr">
          {issuer.street && <span>{issuer.street}<br /></span>}
          {(issuer.zip || issuer.city) && (
            <span>{issuer.zip} {issuer.city}<br /></span>
          )}
        </div>
        {(issuer.phone || issuer.email) && (
          <div className="inv-p-issuer-contact">
            {issuer.phone && <span>Tel. {issuer.phone}</span>}
            {issuer.phone && issuer.email && <span> · </span>}
            {issuer.email && <span>{issuer.email}</span>}
          </div>
        )}
      </div>
      {website && (
        <div className="inv-p-page-header-right">
          <span className="inv-p-website">{website}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function InvoicePrintView({
  invoice,
  totalBrutto,
  totalNetto,
  totalMwst,
  discountAmount,
  breakdown,
  qrBillSvg,
}: InvoicePrintViewProps) {
  const { issuer, recipient, items, showQRSection } = invoice;

  const datumStr = formatDate(invoice.datum);
  const leistungStr = invoice.leistungsDatum ? formatDate(invoice.leistungsDatum) : null;
  const faelligStr = invoice.faelligkeitsDatum ? formatDate(invoice.faelligkeitsDatum) : null;

  // Zahlungsfrist label (e.g. "30 Tage netto")
  const zahlungsfristLabel = invoice.zahlungsfrist
    ? `${invoice.zahlungsfrist} Tage netto`
    : null;

  // For QR-Rechnung: creditor snapshot for page 2 bank section
  const snap = invoice.issuer; // issuer already populated from qrCreditorSnapshot

  return (
    <div className="invoice-print-view">

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 1 — Invoice content
      ══════════════════════════════════════════════════════════════════════ */}

      {/* ── Page header: logo + store name + address + website ── */}
      <PageHeader invoice={invoice} />

      {/* ── Document title + metadata table (right-aligned, 2-col) ── */}
      <div className="inv-p-doc-block">
        {/* Left: recipient address block (like a window envelope) */}
        <div className="inv-p-recipient-block">
          <div className="inv-p-recipient-name">{recipient.name}</div>
          {recipient.street && (
            <div className="inv-p-recipient-addr">{recipient.street}</div>
          )}
          {(recipient.zip || recipient.city) && (
            <div className="inv-p-recipient-addr">{recipient.zip} {recipient.city}</div>
          )}
          {recipient.country && (
            <div className="inv-p-recipient-addr">{recipient.country}</div>
          )}
        </div>

        {/* Right: Rechnung XXXXXXX + meta rows */}
        <div className="inv-p-title-block">
          <div className="inv-p-doc-type">
            {invoice.documentType ?? 'Rechnung'} {invoice.nummer}
          </div>
          <table className="inv-p-meta-table">
            <tbody>
              <tr>
                <td className="inv-p-meta-label">Rechnungsdatum</td>
                <td className="inv-p-meta-value">{datumStr}</td>
              </tr>
              {invoice.isDeferredPayment && faelligStr && (
                <tr>
                  <td className="inv-p-meta-label">Fälligkeitsdatum</td>
                  <td className="inv-p-meta-value inv-p-meta-bold">{faelligStr}</td>
                </tr>
              )}
              {leistungStr && leistungStr !== datumStr && (
                <tr>
                  <td className="inv-p-meta-label">Leistungsdatum</td>
                  <td className="inv-p-meta-value">{leistungStr}</td>
                </tr>
              )}
              {invoice.orderId && (
                <tr>
                  <td className="inv-p-meta-label">Auftrag</td>
                  <td className="inv-p-meta-value">{invoice.orderId}</td>
                </tr>
              )}
              {recipient.name && (
                <tr>
                  <td className="inv-p-meta-label">Ihre Referenz</td>
                  <td className="inv-p-meta-value">{recipient.name}</td>
                </tr>
              )}
              {issuer.mwstNummer && (
                <tr>
                  <td className="inv-p-meta-label">MwSt-Nr.</td>
                  <td className="inv-p-meta-value">{issuer.mwstNummer}</td>
                </tr>
              )}
              {zahlungsfristLabel && (
                <tr>
                  <td className="inv-p-meta-label">Zahlungsbedingungen</td>
                  <td className="inv-p-meta-value">{zahlungsfristLabel}</td>
                </tr>
              )}
              <tr>
                <td className="inv-p-meta-label">Währung</td>
                <td className="inv-p-meta-value">{invoice.waehrung ?? 'CHF'}</td>
              </tr>
              {invoice.paymentMethodDisplay && invoice.paymentMethodDisplay !== '—' && (
                <tr>
                  <td className="inv-p-meta-label">Zahlungsart</td>
                  <td className="inv-p-meta-value">{invoice.paymentMethodDisplay}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Line items table — Digitec style: Beschreibung / Menge / MwSt / Preis exkl. / Preis inkl. ── */}
      <table className="inv-p-items-table">
        <thead>
          <tr>
            <th className="inv-p-th inv-p-col-desc">Beschreibung</th>
            <th className="inv-p-th inv-p-col-qty inv-p-td-right">Menge</th>
            <th className="inv-p-th inv-p-col-mwst inv-p-td-right">MwSt.</th>
            <th className="inv-p-th inv-p-col-price inv-p-td-right">Preis exkl.</th>
            <th className="inv-p-th inv-p-col-total inv-p-td-right">Preis inkl.</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item) => {
            const r = normalizeSwissMwStRate(item.mwstRate);
            const nettoUnit = r === 0 ? item.unitPrice : item.unitPrice / (1 + r);
            return (
              <tr key={item.id} className="inv-p-item-row">
                <td className="inv-p-td inv-p-col-desc">
                  <div className="inv-p-item-name">{item.description}</div>
                  {item.detail && (
                    <div className="inv-p-item-detail">{item.detail}</div>
                  )}
                </td>
                <td className="inv-p-td inv-p-td-right inv-p-td-muted inv-p-col-qty">
                  {item.quantity}
                </td>
                <td className="inv-p-td inv-p-td-right inv-p-col-mwst">
                  {formatMwStRate(item.mwstRate)}
                </td>
                <td className="inv-p-td inv-p-td-right inv-p-td-muted inv-p-col-price">
                  {formatCHF(nettoUnit * item.quantity)}
                </td>
                <td className="inv-p-td inv-p-td-right inv-p-td-bold inv-p-col-total">
                  {formatCHF(item.totalBrutto)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── Totals block — right-aligned, Digitec style ── */}
      <div className="inv-p-totals-section">
        {/* Subtotals row: Netto exkl. | Brutto inkl. */}
        <div className="inv-p-totals-header-row">
          <span />
          <span className="inv-p-totals-col-label">Betrag exkl.</span>
          <span className="inv-p-totals-col-label">Betrag inkl.</span>
        </div>
        <div className="inv-p-totals-data-row">
          <span className="inv-p-total-label">Gesamtbetrag</span>
          <span className="inv-p-total-amount">{formatCHF(totalNetto)}</span>
          <span className="inv-p-total-amount">{formatCHF(totalBrutto)}</span>
        </div>

        {/* MwSt breakdown */}
        <div className="inv-p-totals-mwst-label">
          Gesamtbetrag enthält folgende Mehrwertsteuer:
        </div>
        {breakdown.map((g) => (
          <div key={`${g.rate}-${g.code}`} className="inv-p-totals-mwst-row">
            <span>MwSt. {formatMwStRate(g.rate)}</span>
            <span className="inv-p-total-amount">{formatCHF(g.mwst)}</span>
          </div>
        ))}

        {discountAmount > 0 && (
          <div className="inv-p-totals-data-row">
            <span className="inv-p-total-label">Rabatt</span>
            <span />
            <span className="inv-p-total-amount">− {formatCHF(discountAmount)}</span>
          </div>
        )}

        {/* Grand total line */}
        <div className="inv-p-total-divider" />
        <div className="inv-p-total-grand-row">
          <span>Total aller Lieferungen und Leistungen {invoice.waehrung ?? 'CHF'}</span>
          <span className="inv-p-total-grand-amount">{formatCHF(totalBrutto)}</span>
        </div>
        <div className="inv-p-total-rechnung-row">
          <span>Rechnungsbetrag</span>
          <span className="inv-p-total-grand-amount">{formatCHF(totalBrutto)}</span>
        </div>
      </div>

      {/* ── Notes ── */}
      {invoice.notes && (
        <div className="inv-p-notes">{invoice.notes}</div>
      )}

      {/* ── Page footer (repeated on every page via CSS) ── */}
      <div className="inv-p-footer">
        <span>{issuer.name}</span>
        {issuer.street && <span> · {issuer.street}</span>}
        {(issuer.zip || issuer.city) && <span>, {issuer.zip} {issuer.city}</span>}
        {issuer.mwstNummer && <span> · {issuer.mwstNummer}</span>}
        {issuer.phone && <span> · Tel. {issuer.phone}</span>}
        {issuer.email && <span> · {issuer.email}</span>}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 2 — Payment info + Swiss QR-Bill (nur QR-Rechnung)
      ══════════════════════════════════════════════════════════════════════ */}
      {showQRSection && qrBillSvg && (
        <div className="inv-p-payment-page">
          {/* Same page header on page 2 */}
          <PageHeader invoice={invoice} />

          {/* Intro text */}
          <div className="inv-p-payment-intro">
            Verwenden Sie die Zahlungsinformationen unten.
          </div>

          {/* Bank payment block */}
          <div className="inv-p-bank-block">
            <div className="inv-p-bank-title">QR-Rechnung</div>
            <p className="inv-p-bank-desc">
              Scannen Sie den QR-Code mit Ihrer Schweizer Banking-App (UBS, ZKB, Raiffeisen,
              PostFinance) oder verwenden Sie die untenstehenden Daten für eine manuelle Zahlung.
              Vergessen Sie nicht, die Referenz anzugeben.
            </p>
            <table className="inv-p-bank-table">
              <tbody>
                <tr>
                  <td className="inv-p-bank-label">Zugunsten von</td>
                  <td className="inv-p-bank-value">
                    {snap.name}
                    {snap.street && `, ${snap.street}`}
                    {(snap.zip || snap.city) && `, CH-${snap.zip} ${snap.city}`}
                  </td>
                </tr>
                {snap.iban && (
                  <tr>
                    <td className="inv-p-bank-label">IBAN</td>
                    <td className="inv-p-bank-value inv-p-bank-mono">{snap.iban}</td>
                  </tr>
                )}
                {invoice.referenz && (
                  <tr>
                    <td className="inv-p-bank-label">Verwendungszweck</td>
                    <td className="inv-p-bank-value">
                      {invoice.documentType ?? 'Rechnung'} {invoice.nummer}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="inv-p-bank-label">Betrag offen</td>
                  <td className="inv-p-bank-value inv-p-bank-bold">
                    {invoice.waehrung ?? 'CHF'} {formatCHF(totalBrutto)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Swiss QR-Bill slip (Empfangsschein + Zahlteil) */}
          <div className="inv-p-qr-section">
            <div className="inv-p-cutline">
              <span className="inv-p-scissors">✂</span>
              <div className="inv-p-cutline-dashes" />
            </div>
            <img
              src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrBillSvg)}`}
              alt="QR-Rechnung Zahlschein"
              className="inv-p-qr-img"
            />
          </div>
        </div>
      )}
    </div>
  );
}
