'use client';

import { useMemo, useRef } from 'react';
import {
  Download,
  Printer,
  Mail,
  Copy,
  Check,
  Scissors,
  MoreHorizontal,
} from 'lucide-react';
import {
  formatCHF,
  formatDate,
  formatMwStRate,
  calculateMwStBreakdown,
  getStatusConfig,
  type Invoice,
  type MwStGroup,
} from '@/lib/invoice-utils';

// =============================================================================
// Swiss Invoice Template
// Design: Swiss International Style (Neue Grafik / Helvetica tradition)
// Compliance: Art. 26 MWSTG — all mandatory fields included
// =============================================================================

interface InvoiceTemplateProps {
  invoice: Invoice;
  showActions?: boolean;
  isMobile?: boolean;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status as any);
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full
        text-[10px] font-semibold tracking-[0.08em] uppercase
        ${config.bgColor} ${config.textColor} ring-1 ${config.ringColor}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}

function MwStCodeBadge({ code, rate }: { code: string; rate: number }) {
  // Color scheme based on rate type
  const isReduced = rate <= 0.026;
  const isSpecial = rate === 0.038;
  const isExempt = rate === 0;

  const colorClass = isExempt
    ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
    : isReduced
    ? 'bg-sky-50 text-sky-600 ring-sky-200'
    : isSpecial
    ? 'bg-amber-50 text-amber-600 ring-amber-200'
    : 'bg-gray-100 text-gray-500 ring-gray-200';

  return (
    <span
      className={`
        inline-flex items-center justify-center
        w-6 h-5 rounded text-[10px] font-bold tracking-wide
        ring-1 ${colorClass}
      `}
    >
      {code}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] text-gray-300 uppercase tracking-[0.15em] font-semibold mb-2 select-none">
      {children}
    </div>
  );
}

function QRCodePlaceholder() {
  return (
    <div className="w-[120px] h-[120px] md:w-[132px] md:h-[132px] bg-white border-2 border-gray-900 p-1 relative flex-shrink-0">
      <div className="w-full h-full relative">
        {/* Swiss cross center marker */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-6 h-6 md:w-7 md:h-7 bg-[#FF0000] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="6" y="1" width="4" height="14" fill="white" />
              <rect x="1" y="6" width="14" height="4" fill="white" />
            </svg>
          </div>
        </div>
        {/* QR pattern */}
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-75">
          <rect x="2" y="2" width="22" height="22" fill="#111" />
          <rect x="5" y="5" width="16" height="16" fill="white" />
          <rect x="8" y="8" width="10" height="10" fill="#111" />
          <rect x="76" y="2" width="22" height="22" fill="#111" />
          <rect x="79" y="5" width="16" height="16" fill="white" />
          <rect x="82" y="8" width="10" height="10" fill="#111" />
          <rect x="2" y="76" width="22" height="22" fill="#111" />
          <rect x="5" y="79" width="16" height="16" fill="white" />
          <rect x="8" y="82" width="10" height="10" fill="#111" />
          {[
            [28,4],[32,8],[40,4],[48,12],[56,4],[60,8],[64,16],[68,4],
            [28,16],[36,12],[44,20],[52,8],[60,20],[68,12],
            [4,28],[12,32],[20,28],[28,36],[36,28],[44,32],[52,28],
            [60,36],[68,28],[76,32],[84,28],[92,36],
            [4,44],[16,48],[28,44],[36,52],[60,48],[68,44],[76,52],[88,44],
            [4,60],[12,56],[20,64],[28,56],[36,64],[60,56],[68,64],[76,56],[88,60],
            [4,68],[16,72],[28,68],[40,72],[52,68],[64,72],[76,68],[88,72],
            [28,80],[36,88],[48,80],[60,88],[72,80],[84,88],[92,80],
            [28,92],[40,92],[56,92],[68,92],[80,92],[92,92],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="4" height="4" fill="#111" />
          ))}
        </svg>
      </div>
    </div>
  );
}

function CutLine() {
  return (
    <div className="flex items-center gap-2 py-3 select-none print:hidden" aria-hidden="true">
      <Scissors className="w-3.5 h-3.5 text-gray-300 rotate-90" />
      <div className="flex-1 border-t-2 border-dashed border-gray-200" />
    </div>
  );
}

// ─── Action Buttons ──────────────────────────────────────────────────────────

function ActionBar({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="flex items-center gap-1.5 print:hidden">
      {[
        { icon: Printer, label: 'Drucken', onClick: onPrint },
        { icon: Download, label: 'PDF', onClick: () => {} },
        { icon: Mail, label: 'Senden', onClick: () => {} },
        { icon: Copy, label: 'Kopieren', onClick: () => {} },
      ].map(({ icon: Icon, label, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          title={label}
          className="
            group flex items-center gap-1.5
            px-3 py-2 rounded-lg
            text-xs font-medium text-gray-500
            bg-white border border-gray-200
            hover:border-gray-300 hover:text-gray-800 hover:shadow-sm
            active:scale-[0.97]
            transition-all duration-150
          "
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InvoiceTemplate({
  invoice,
  showActions = true,
  isMobile = false,
}: InvoiceTemplateProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Compute VAT breakdown
  const { breakdown, totalBrutto, totalNetto, totalMwst } = useMemo(() => {
    if (!invoice.items?.length) {
      return {
        breakdown: [] as MwStGroup[],
        totalBrutto: invoice.totalBrutto || 0,
        totalNetto: invoice.totalNetto || 0,
        totalMwst: invoice.totalMwst || 0,
      };
    }
    const groups = calculateMwStBreakdown(invoice.items);
    const brutto = invoice.items.reduce((s, i) => s + i.totalBrutto, 0);
    const mwst = groups.reduce((s, g) => s + g.mwst, 0);
    return {
      breakdown: groups,
      totalBrutto: brutto,
      totalNetto: brutto - mwst,
      totalMwst: mwst,
    };
  }, [invoice.items, invoice.totalBrutto, invoice.totalNetto, invoice.totalMwst]);

  const handlePrint = () => {
    window.print();
  };

  const issuer = invoice.issuer;
  const recipient = invoice.recipient;

  // Responsive padding
  const px = isMobile ? 'px-5' : 'px-10 lg:px-14';

  return (
    <div className="w-full">
      {/* ── Toolbar ── */}
      {showActions && (
        <div className={`flex items-center justify-between mb-4 print:hidden ${isMobile ? 'px-4' : ''}`}>
          <StatusBadge status={invoice.status} />
          <ActionBar onPrint={handlePrint} />
        </div>
      )}

      {/* ── Invoice Paper ── */}
      <div
        ref={printRef}
        className={`
          bg-white
          ${isMobile ? 'rounded-none' : 'rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)]'}
          overflow-hidden
          print:shadow-none print:rounded-none
        `}
        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      >
        {/* Red accent stripe */}
        <div className="h-[3px] bg-[#FF0000]" />

        {/* ═══ HEADER ═══ */}
        <div className={`${px} pt-8 pb-6 md:pt-10 md:pb-8`}>
          <div className="flex justify-between items-start gap-4">
            {/* Issuer info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-3">
                {/* Logo mark */}
                <div className="w-9 h-9 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm leading-none">
                    {issuer.name?.charAt(0) || 'R'}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-900 tracking-wide truncate">
                    {issuer.name}
                  </div>
                  {issuer.mwstNummer && (
                    <div className="text-[10px] text-gray-400 font-mono tracking-wider">
                      {issuer.mwstNummer}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[11px] text-gray-400 leading-relaxed">
                {issuer.street && <div>{issuer.street}</div>}
                <div>
                  {issuer.zip} {issuer.city}
                </div>
                {issuer.country && <div>{issuer.country}</div>}
              </div>
            </div>

            {/* Title + meta */}
            <div className="text-right flex-shrink-0">
              <h1
                className="text-2xl md:text-[32px] font-extralight text-gray-900 leading-none"
                style={{ letterSpacing: '-0.03em' }}
              >
                Rechnung
              </h1>
              <div className="mt-3 space-y-0.5">
                {[
                  { label: 'Nr.', value: invoice.nummer, bold: false },
                  { label: 'Datum', value: formatDate(invoice.datum), bold: false },
                  invoice.leistungsDatum && {
                    label: 'Leistung',
                    value: formatDate(invoice.leistungsDatum),
                    bold: false,
                  },
                  {
                    label: 'Fällig',
                    value: formatDate(invoice.faelligkeitsDatum),
                    bold: true,
                  },
                ]
                  .filter(Boolean)
                  .map((meta: any) => (
                    <div key={meta.label} className="text-[11px] text-gray-400 flex items-baseline justify-end gap-2">
                      <span className="w-16 text-right">{meta.label}</span>
                      <span
                        className={`${
                          meta.bold
                            ? 'text-gray-900 font-bold'
                            : 'text-gray-600 font-medium'
                        }`}
                      >
                        {meta.value}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Mobile-only status badge */}
              {isMobile && !showActions && (
                <div className="mt-3">
                  <StatusBadge status={invoice.status} />
                </div>
              )}
            </div>
          </div>

          {/* Recipient */}
          <div className="mt-8 md:mt-10">
            <SectionLabel>Rechnungsempfänger</SectionLabel>
            <div className="text-[13px] text-gray-800 leading-relaxed">
              <div className="font-semibold">{recipient.name}</div>
              {recipient.street && (
                <div className="text-gray-500">{recipient.street}</div>
              )}
              <div className="text-gray-500">
                {recipient.zip} {recipient.city}
              </div>
              {recipient.uid && (
                <div className="text-[11px] text-gray-400 font-mono mt-1">
                  {recipient.uid}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ LINE ITEMS ═══ */}
        <div className={px}>
          {/* Table header */}
          <div
            className={`
              grid gap-2 py-2.5
              border-y-2 border-gray-900
              text-[9px] md:text-[10px] uppercase tracking-[0.12em] text-gray-400 font-semibold
              select-none
              ${isMobile ? 'grid-cols-12' : 'grid-cols-12'}
            `}
          >
            <div className="col-span-1 hidden md:block">Pos</div>
            <div className={isMobile ? 'col-span-7' : 'col-span-5'}>Beschreibung</div>
            {!isMobile && <div className="col-span-1 text-right">Menge</div>}
            {!isMobile && <div className="col-span-2 text-right">Einzelpreis</div>}
            <div className={`${isMobile ? 'col-span-2' : 'col-span-1'} text-center`}>MwSt</div>
            <div className={`${isMobile ? 'col-span-3' : 'col-span-2'} text-right`}>Betrag</div>
          </div>

          {/* Table rows */}
          {invoice.items?.map((item, index) => (
            <div
              key={item.id}
              className={`
                grid gap-2 py-3 md:py-3.5
                ${index < (invoice.items?.length ?? 0) - 1 ? 'border-b border-gray-100' : ''}
                ${isMobile ? 'grid-cols-12' : 'grid-cols-12'}
              `}
            >
              {/* Position number — desktop only */}
              {!isMobile && (
                <div className="col-span-1 text-[11px] text-gray-300 font-mono pt-0.5">
                  {String(index + 1).padStart(2, '0')}
                </div>
              )}

              {/* Description */}
              <div className={isMobile ? 'col-span-7' : 'col-span-5'}>
                <div className="text-[12px] md:text-[13px] text-gray-800 font-medium leading-snug">
                  {item.description}
                </div>
                {item.detail && (
                  <div className="text-[10px] md:text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    {item.detail}
                  </div>
                )}
                {/* Mobile quantity info */}
                {isMobile && (
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {item.quantity} × {formatCHF(item.unitPrice)}
                  </div>
                )}
              </div>

              {/* Quantity — desktop only */}
              {!isMobile && (
                <div className="col-span-1 text-right text-[13px] text-gray-500 pt-0.5 tabular-nums">
                  {item.quantity}
                </div>
              )}

              {/* Unit price — desktop only */}
              {!isMobile && (
                <div className="col-span-2 text-right text-[13px] text-gray-500 pt-0.5 tabular-nums">
                  {formatCHF(item.unitPrice)}
                </div>
              )}

              {/* MwSt code */}
              <div className={`${isMobile ? 'col-span-2' : 'col-span-1'} flex justify-center pt-0.5`}>
                <MwStCodeBadge code={item.mwstCode} rate={item.mwstRate} />
              </div>

              {/* Total */}
              <div
                className={`${isMobile ? 'col-span-3' : 'col-span-2'} text-right text-[12px] md:text-[13px] text-gray-900 font-semibold pt-0.5 tabular-nums`}
              >
                {formatCHF(item.totalBrutto)}
              </div>
            </div>
          ))}
        </div>

        {/* ═══ TOTALS ═══ */}
        <div className={`${px} mt-3 mb-6 md:mb-8`}>
          <div className={`flex ${isMobile ? 'justify-end' : 'justify-end'}`}>
            <div className={isMobile ? 'w-full' : 'w-72'}>
              {/* Subtotal netto */}
              <div className="flex justify-between py-1.5 text-[12px]">
                <span className="text-gray-400">Zwischensumme netto</span>
                <span className="text-gray-600 font-medium tabular-nums">
                  {formatCHF(totalNetto)}
                </span>
              </div>

              {/* MwSt lines */}
              {breakdown.map((g) => (
                <div key={g.code} className="flex justify-between items-center py-1 text-[12px]">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <MwStCodeBadge code={g.code} rate={g.rate} />
                    <span>MwSt {formatMwStRate(g.rate)}</span>
                  </span>
                  <span className="text-gray-500 tabular-nums">{formatCHF(g.mwst)}</span>
                </div>
              ))}

              {/* Divider */}
              <div className="border-t-2 border-gray-900 my-2.5" />

              {/* Grand total */}
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-semibold">
                  Gesamtbetrag {invoice.waehrung || 'CHF'}
                </span>
                <span
                  className="text-xl md:text-2xl font-bold text-gray-900 tabular-nums"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {formatCHF(totalBrutto)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ MWST SUMMARY TABLE ═══ */}
        {breakdown.length > 0 && (
          <div className={`${px} pb-5`}>
            <div className="bg-gray-50 rounded-lg p-4 md:p-5">
              <SectionLabel>MwSt-Zusammenfassung</SectionLabel>
              <div className="grid grid-cols-5 gap-3 text-[9px] md:text-[10px] text-gray-400 font-semibold uppercase tracking-[0.1em] pb-2 border-b border-gray-200">
                <div>Code</div>
                <div>Satz</div>
                <div className="text-right">Brutto</div>
                <div className="text-right">Netto</div>
                <div className="text-right">MwSt</div>
              </div>
              {breakdown.map((g) => (
                <div
                  key={g.code}
                  className="grid grid-cols-5 gap-3 text-[11px] md:text-[12px] py-1.5"
                >
                  <div>
                    <MwStCodeBadge code={g.code} rate={g.rate} />
                  </div>
                  <div className="text-gray-500 tabular-nums">{formatMwStRate(g.rate)}</div>
                  <div className="text-right text-gray-500 tabular-nums">{formatCHF(g.brutto)}</div>
                  <div className="text-right text-gray-500 tabular-nums">{formatCHF(g.netto)}</div>
                  <div className="text-right text-gray-800 font-semibold tabular-nums">
                    {formatCHF(g.mwst)}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-5 gap-3 text-[11px] md:text-[12px] pt-2 border-t border-gray-200 font-semibold text-gray-800">
                <div className="col-span-2">Total</div>
                <div className="text-right tabular-nums">{formatCHF(totalBrutto)}</div>
                <div className="text-right tabular-nums">{formatCHF(totalNetto)}</div>
                <div className="text-right tabular-nums">{formatCHF(totalMwst)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ NOTES ═══ */}
        {invoice.notes && (
          <div className={`${px} pb-4`}>
            <p className="text-[11px] text-gray-400 leading-relaxed">{invoice.notes}</p>
          </div>
        )}

        {/* ═══ QR-RECHNUNG (PAYMENT SLIP) ═══ */}
        {issuer.iban && (
          <>
            <div className={`${px}`}>
              <CutLine />
            </div>

            <div className={`${px} pb-8`}>
              <div className="border-2 border-gray-900 rounded-sm overflow-hidden">
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} ${isMobile ? '' : 'divide-x-2'} divide-gray-900`}>
                  {/* Left: Zahlteil (Payment section) */}
                  <div className="p-4 md:p-5">
                    <div className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3 text-gray-900">
                      Zahlteil
                    </div>
                    <div className={`flex ${isMobile ? 'flex-col' : ''} gap-4`}>
                      <QRCodePlaceholder />
                      <div className="text-[10px] md:text-[11px] space-y-2.5 flex-1 min-w-0">
                        <div>
                          <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">
                            Konto / Zahlbar an
                          </div>
                          <div className="text-gray-800 leading-relaxed font-mono text-[10px]">
                            {issuer.iban}
                          </div>
                          <div className="text-gray-700 leading-relaxed">
                            {issuer.name}
                            <br />
                            {issuer.street && <>{issuer.street}<br /></>}
                            {issuer.zip} {issuer.city}
                          </div>
                        </div>
                        {invoice.referenz && (
                          <div>
                            <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">
                              Referenz
                            </div>
                            <div className="text-gray-800 font-mono text-[10px]">
                              {invoice.referenz}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">
                            Zahlbar durch
                          </div>
                          <div className="text-gray-700 leading-relaxed">
                            {recipient.name}
                            <br />
                            {recipient.street && <>{recipient.street}<br /></>}
                            {recipient.zip} {recipient.city}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-4 mt-4 pt-3 border-t border-gray-200">
                      <div>
                        <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">
                          Währung
                        </div>
                        <div className="text-[12px] font-bold text-gray-900">
                          {invoice.waehrung || 'CHF'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">
                          Betrag
                        </div>
                        <div className="text-[12px] font-bold text-gray-900 tabular-nums">
                          {formatCHF(totalBrutto)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Empfangsschein (Receipt) */}
                  <div className={`p-4 md:p-5 ${isMobile ? 'border-t-2 border-gray-900' : ''}`}>
                    <div className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3 text-gray-900">
                      Empfangsschein
                    </div>
                    <div className="text-[10px] space-y-2.5">
                      <div>
                        <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">
                          Konto / Zahlbar an
                        </div>
                        <div className="text-gray-800 font-mono text-[10px] leading-relaxed">
                          {issuer.iban}
                        </div>
                        <div className="text-gray-700 leading-relaxed">
                          {issuer.name}
                          <br />
                          {issuer.zip} {issuer.city}
                        </div>
                      </div>
                      {invoice.referenz && (
                        <div>
                          <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">
                            Referenz
                          </div>
                          <div className="text-gray-800 font-mono text-[10px]">
                            {invoice.referenz}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">
                          Zahlbar durch
                        </div>
                        <div className="text-gray-700 leading-relaxed">
                          {recipient.name}
                          <br />
                          {recipient.zip} {recipient.city}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-4 pt-2 border-t border-gray-200">
                        <div>
                          <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">
                            Währung
                          </div>
                          <div className="text-[11px] font-bold text-gray-900">
                            {invoice.waehrung || 'CHF'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">
                            Betrag
                          </div>
                          <div className="text-[11px] font-bold text-gray-900 tabular-nums">
                            {formatCHF(totalBrutto)}
                          </div>
                        </div>
                      </div>
                      <div className="pt-4">
                        <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">
                          Annahmestelle
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══ FOOTER ═══ */}
        <div className={`${px} py-4 border-t border-gray-100`}>
          <div className={`flex ${isMobile ? 'flex-col gap-1' : 'justify-between'} text-[10px] text-gray-300`}>
            <div>
              {issuer.name}
              {issuer.mwstNummer && <> · {issuer.mwstNummer}</>}
            </div>
            <div>
              {issuer.bank && <>{issuer.bank} · </>}
              {issuer.iban}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
