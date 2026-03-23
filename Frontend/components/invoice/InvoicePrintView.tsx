// =============================================================================
// InvoicePrintView — Layout exclusivo para @media print / PDF
// Visible SOLO al imprimir. En pantalla: display:none (via CSS).
// No usa Tailwind responsive — solo clases inv-p-* definidas en globals.css
// =============================================================================

import {
  formatCHF,
  formatDate,
  formatMwStRate,
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

  return (
    <div className="invoice-print-view">

      {/* ═══ HEADER: Emisor + Título ═══ */}
      <div className="inv-p-header">
        {/* Izquierda: datos del emisor */}
        <div className="inv-p-issuer">
          {invoice.storeLogo ? (
            <img
              src={invoice.storeLogo}
              alt={issuer.name}
              className="inv-p-logo"
            />
          ) : (
            <div className="inv-p-logo-mark">
              {issuer.name?.charAt(0) ?? 'R'}
            </div>
          )}
          <div className="inv-p-issuer-name">{issuer.name}</div>
          {issuer.mwstNummer && (
            <div className="inv-p-issuer-vat">{issuer.mwstNummer}</div>
          )}
          <div className="inv-p-issuer-addr">
            {issuer.street && <span>{issuer.street}<br /></span>}
            {issuer.zip} {issuer.city}
            {issuer.country && issuer.country !== 'Schweiz' && (
              <span><br />{issuer.country}</span>
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

        {/* Derecha: tipo de documento + metadatos */}
        <div className="inv-p-title-block">
          <div className="inv-p-doc-type">{invoice.documentType ?? 'Rechnung'}</div>
          <table className="inv-p-meta-table">
            <tbody>
              <tr>
                <td className="inv-p-meta-label">Nr.</td>
                <td className="inv-p-meta-value">{invoice.nummer}</td>
              </tr>
              <tr>
                <td className="inv-p-meta-label">Datum</td>
                <td className="inv-p-meta-value">{datumStr}</td>
              </tr>
              {leistungStr && leistungStr !== datumStr && (
                <tr>
                  <td className="inv-p-meta-label">Leistung</td>
                  <td className="inv-p-meta-value">{leistungStr}</td>
                </tr>
              )}
              {invoice.isDeferredPayment && faelligStr && faelligStr !== datumStr && (
                <tr>
                  <td className="inv-p-meta-label">Fällig</td>
                  <td className="inv-p-meta-value inv-p-meta-bold">{faelligStr}</td>
                </tr>
              )}
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

      {/* ═══ RECIPIENT ═══ */}
      <div className="inv-p-recipient-section">
        <div className="inv-p-section-label">Rechnungsempfänger</div>
        <div className="inv-p-recipient-name">{recipient.name}</div>
        {recipient.street && <div className="inv-p-recipient-addr">{recipient.street}</div>}
        {(recipient.zip || recipient.city) && (
          <div className="inv-p-recipient-addr">
            {recipient.zip} {recipient.city}
          </div>
        )}
        {recipient.email && (
          <div className="inv-p-recipient-contact">{recipient.email}</div>
        )}
      </div>

      {/* ═══ LINE ITEMS TABLE ═══ */}
      <table className="inv-p-items-table">
        <thead>
          <tr>
            <th className="inv-p-th inv-p-col-pos">Pos</th>
            <th className="inv-p-th inv-p-col-desc">Beschreibung</th>
            <th className="inv-p-th inv-p-col-qty">Menge</th>
            <th className="inv-p-th inv-p-col-price">Einzelpreis</th>
            <th className="inv-p-th inv-p-col-mwst">MwSt</th>
            <th className="inv-p-th inv-p-col-total">Betrag</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item, i) => (
            <tr key={item.id} className="inv-p-item-row">
              <td className="inv-p-td inv-p-td-muted inv-p-col-pos">
                {String(i + 1).padStart(2, '0')}
              </td>
              <td className="inv-p-td inv-p-col-desc">
                <div className="inv-p-item-name">{item.description}</div>
                {item.detail && (
                  <div className="inv-p-item-detail">{item.detail}</div>
                )}
              </td>
              <td className="inv-p-td inv-p-td-right inv-p-td-muted inv-p-col-qty">
                {item.quantity}
              </td>
              <td className="inv-p-td inv-p-td-right inv-p-td-muted inv-p-col-price">
                {formatCHF(item.unitPrice)}
              </td>
              <td className="inv-p-td inv-p-td-center inv-p-col-mwst">
                <span className="inv-p-mwst-badge">{item.mwstCode}</span>
              </td>
              <td className="inv-p-td inv-p-td-right inv-p-td-bold inv-p-col-total">
                {formatCHF(item.totalBrutto)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ═══ TOTALS ═══ */}
      <div className="inv-p-totals-section">
        <div className="inv-p-total-row">
          <span className="inv-p-total-label">Zwischensumme netto</span>
          <span className="inv-p-total-amount">{formatCHF(totalNetto)}</span>
        </div>
        {breakdown.map((g) => (
          <div key={g.code} className="inv-p-total-row inv-p-total-muted">
            <span className="inv-p-total-label">
              MwSt {g.code} {formatMwStRate(g.rate)}
            </span>
            <span className="inv-p-total-amount">{formatCHF(g.mwst)}</span>
          </div>
        ))}
        {discountAmount > 0 && (
          <div className="inv-p-total-row">
            <span className="inv-p-total-label">Rabatt</span>
            <span className="inv-p-total-amount">− {formatCHF(discountAmount)}</span>
          </div>
        )}
        <div className="inv-p-total-divider" />
        <div className="inv-p-total-grand">
          <span>Gesamtbetrag {invoice.waehrung ?? 'CHF'}</span>
          <span>{formatCHF(totalBrutto)}</span>
        </div>
      </div>

      {/* ═══ MWST SUMMARY TABLE ═══ */}
      {breakdown.length > 0 && (
        <div className="inv-p-mwst-section">
          <div className="inv-p-section-label">MwSt-Zusammenfassung</div>
          <table className="inv-p-mwst-table">
            <thead>
              <tr>
                <th className="inv-p-mwst-th">Code</th>
                <th className="inv-p-mwst-th">Satz</th>
                <th className="inv-p-mwst-th inv-p-td-right">Brutto</th>
                <th className="inv-p-mwst-th inv-p-td-right">Netto</th>
                <th className="inv-p-mwst-th inv-p-td-right">MwSt</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((g) => (
                <tr key={g.code}>
                  <td className="inv-p-mwst-td">
                    <span className="inv-p-mwst-badge">{g.code}</span>
                  </td>
                  <td className="inv-p-mwst-td">{formatMwStRate(g.rate)}</td>
                  <td className="inv-p-mwst-td inv-p-td-right">{formatCHF(g.brutto)}</td>
                  <td className="inv-p-mwst-td inv-p-td-right">{formatCHF(g.netto)}</td>
                  <td className="inv-p-mwst-td inv-p-td-right inv-p-td-bold">
                    {formatCHF(g.mwst)}
                  </td>
                </tr>
              ))}
              <tr className="inv-p-mwst-total-row">
                <td className="inv-p-mwst-td inv-p-td-bold" colSpan={2}>Total</td>
                <td className="inv-p-mwst-td inv-p-td-right inv-p-td-bold">
                  {formatCHF(totalBrutto)}
                </td>
                <td className="inv-p-mwst-td inv-p-td-right inv-p-td-bold">
                  {formatCHF(totalNetto)}
                </td>
                <td className="inv-p-mwst-td inv-p-td-right inv-p-td-bold">
                  {formatCHF(totalMwst)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ NOTES ═══ */}
      {invoice.notes && (
        <div className="inv-p-notes">{invoice.notes}</div>
      )}

      {/* ═══ FOOTER ═══ */}
      <div className="inv-p-footer">
        <span>{issuer.name}</span>
        {issuer.mwstNummer && <span> · {issuer.mwstNummer}</span>}
        {issuer.phone && <span> · {issuer.phone}</span>}
        {issuer.email && <span> · {issuer.email}</span>}
        {issuer.iban && <span> · IBAN: {issuer.iban}</span>}
      </div>

      {/* ═══ QR BILL (Zahlschein) — solo si es QR-Rechnung ═══ */}
      {showQRSection && qrBillSvg && (
        <div className="inv-p-qr-section">
          {/* Línea de corte */}
          <div className="inv-p-cutline">
            <span className="inv-p-scissors">✂</span>
            <div className="inv-p-cutline-dashes" />
          </div>
          {/* El documento Zahlschein es 210×105mm — se escala al ancho imprimible */}
          <img
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrBillSvg)}`}
            alt="QR-Rechnung Zahlschein"
            className="inv-p-qr-img"
          />
        </div>
      )}
    </div>
  );
}
