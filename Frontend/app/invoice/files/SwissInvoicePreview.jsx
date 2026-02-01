import { useState, useMemo } from "react";

// ─── Types & Utils ───────────────────────────────────────────────────────────

const formatCHF = (n) =>
  new Intl.NumberFormat("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const formatDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d) ? "—" : d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const fmtPct = (r) => (r * 100).toFixed(1) + "%";

const calcBreakdown = (items) => {
  const g = {};
  items.forEach((i) => {
    if (!g[i.mwstCode]) g[i.mwstCode] = { code: i.mwstCode, rate: i.mwstRate, brutto: 0 };
    g[i.mwstCode].brutto += i.totalBrutto;
  });
  return Object.values(g).map((x) => ({
    ...x,
    netto: x.brutto / (1 + x.rate),
    mwst: x.brutto - x.brutto / (1 + x.rate),
  }));
};

// ─── Sample Data ─────────────────────────────────────────────────────────────

const invoice = {
  nummer: "2026-0042",
  datum: "2026-01-28",
  leistungsDatum: "2026-01-15",
  faelligkeitsDatum: "2026-02-27",
  waehrung: "CHF",
  referenz: "RF18 5390 0754 7034",
  status: "open",
  issuer: {
    name: "Helvetia Digital GmbH",
    street: "Bahnhofstrasse 42",
    zip: "8001",
    city: "Zürich",
    country: "Schweiz",
    mwstNummer: "CHE-123.456.789 MWST",
    iban: "CH93 0076 2011 6238 5295 7",
    bank: "Zürcher Kantonalbank",
  },
  recipient: {
    name: "Müller & Partner AG",
    attn: "Frau Anna Müller",
    street: "Limmatquai 78",
    zip: "8005",
    city: "Zürich",
    uid: "CHE-987.654.321",
  },
  items: [
    { id: 1, description: "UX/UI Design — Redesign Kundenportal", detail: "40 Stunden à CHF 180.00", quantity: 40, unitPrice: 180, totalBrutto: 7200, mwstRate: 0.081, mwstCode: "A" },
    { id: 2, description: "Frontend-Entwicklung React/Next.js", detail: "60 Stunden à CHF 195.00", quantity: 60, unitPrice: 195, totalBrutto: 11700, mwstRate: 0.081, mwstCode: "A" },
    { id: 3, description: "Projektmanagement & Koordination", detail: "12 Stunden à CHF 160.00", quantity: 12, unitPrice: 160, totalBrutto: 1920, mwstRate: 0.081, mwstCode: "A" },
    { id: 4, description: "Hosting & Domain (12 Monate)", detail: "Jahresabonnement Premium", quantity: 1, unitPrice: 540, totalBrutto: 540, mwstRate: 0.081, mwstCode: "A" },
    { id: 5, description: "Fachbuch: Design Systems Handbook", detail: "Referenzmaterial Projektteam", quantity: 2, unitPrice: 45, totalBrutto: 90, mwstRate: 0.026, mwstCode: "B" },
  ],
  notes: "Zahlbar innerhalb von 30 Tagen netto. Bei Zahlungsverzug wird ein Verzugszins von 5% p.a. berechnet gemäss Art. 104 OR.",
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const c = {
    draft:     { l: "Entwurf",    dot: "bg-gray-400",    bg: "bg-gray-50",     tx: "text-gray-600",    rg: "ring-gray-200" },
    open:      { l: "Offen",      dot: "bg-amber-400",   bg: "bg-amber-50",    tx: "text-amber-700",   rg: "ring-amber-200" },
    paid:      { l: "Bezahlt",    dot: "bg-emerald-400", bg: "bg-emerald-50",  tx: "text-emerald-700", rg: "ring-emerald-200" },
    overdue:   { l: "Überfällig", dot: "bg-red-400",     bg: "bg-red-50",      tx: "text-red-700",     rg: "ring-red-200" },
    cancelled: { l: "Storniert",  dot: "bg-gray-400",    bg: "bg-gray-100",    tx: "text-gray-500",    rg: "ring-gray-200" },
  }[status] || { l: status, dot: "bg-gray-400", bg: "bg-gray-50", tx: "text-gray-600", rg: "ring-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase ${c.bg} ${c.tx} ring-1 ${c.rg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.l}
    </span>
  );
};

const MwStBadge = ({ code, rate }) => {
  const cl = rate <= 0.026 ? "bg-sky-50 text-sky-600 ring-sky-200" : rate === 0.038 ? "bg-amber-50 text-amber-600 ring-amber-200" : rate === 0 ? "bg-emerald-50 text-emerald-600 ring-emerald-200" : "bg-gray-100 text-gray-500 ring-gray-200";
  return <span className={`inline-flex items-center justify-center w-6 h-5 rounded text-[10px] font-bold ring-1 ${cl}`}>{code}</span>;
};

const Label = ({ children }) => (
  <div className="text-[10px] text-gray-300 uppercase tracking-[0.15em] font-semibold mb-2 select-none">{children}</div>
);

const QRCode = () => (
  <div className="w-[120px] h-[120px] bg-white border-2 border-gray-900 p-1 relative flex-shrink-0">
    <div className="w-full h-full relative">
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="w-6 h-6 bg-red-600 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <rect x="6" y="1" width="4" height="14" fill="white" />
            <rect x="1" y="6" width="14" height="4" fill="white" />
          </svg>
        </div>
      </div>
      <svg viewBox="0 0 100 100" className="w-full h-full opacity-75">
        <rect x="2" y="2" width="22" height="22" fill="#111" /><rect x="5" y="5" width="16" height="16" fill="white" /><rect x="8" y="8" width="10" height="10" fill="#111" />
        <rect x="76" y="2" width="22" height="22" fill="#111" /><rect x="79" y="5" width="16" height="16" fill="white" /><rect x="82" y="8" width="10" height="10" fill="#111" />
        <rect x="2" y="76" width="22" height="22" fill="#111" /><rect x="5" y="79" width="16" height="16" fill="white" /><rect x="8" y="82" width="10" height="10" fill="#111" />
        {[[28,4],[32,8],[40,4],[48,12],[56,4],[60,8],[64,16],[68,4],[28,16],[36,12],[44,20],[52,8],[60,20],[68,12],[4,28],[12,32],[20,28],[28,36],[36,28],[44,32],[52,28],[60,36],[68,28],[76,32],[84,28],[92,36],[4,44],[16,48],[28,44],[36,52],[60,48],[68,44],[76,52],[88,44],[4,60],[12,56],[20,64],[28,56],[36,64],[60,56],[68,64],[76,56],[88,60],[4,68],[16,72],[28,68],[40,72],[52,68],[64,72],[76,68],[88,72],[28,80],[36,88],[48,80],[60,88],[72,80],[84,88],[92,80],[28,92],[40,92],[56,92],[68,92],[80,92],[92,92]].map(([x,y],i) => <rect key={i} x={x} y={y} width="4" height="4" fill="#111" />)}
      </svg>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SwissInvoicePreview() {
  const [view, setView] = useState("desktop"); // desktop | mobile | data

  const breakdown = useMemo(() => calcBreakdown(invoice.items), []);
  const totalBrutto = invoice.items.reduce((s, i) => s + i.totalBrutto, 0);
  const totalMwst = breakdown.reduce((s, g) => s + g.mwst, 0);
  const totalNetto = totalBrutto - totalMwst;
  const { issuer: iss, recipient: rec } = invoice;

  const px = view === "mobile" ? "px-5" : "px-10";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(145deg, #edebe6 0%, #e4e0d8 50%, #dbd5cb 100%)", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* ── Top Nav ── */}
      <div className="max-w-4xl mx-auto pt-6 pb-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200/80">
            {[{k:"desktop",l:"Desktop"},{k:"mobile",l:"Mobile"},{k:"data",l:"Schema"}].map(t => (
              <button key={t.k} onClick={() => setView(t.k)} className={`px-4 py-2 text-[10px] font-semibold tracking-[0.1em] uppercase transition-all ${view === t.k ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"}`}>{t.l}</button>
            ))}
          </div>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex gap-1.5">
          {["Drucken","PDF","Senden"].map(a => (
            <button key={a} className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-[10px] font-semibold tracking-wider uppercase text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all">
              {a}
            </button>
          ))}
        </div>
      </div>

      {view === "data" ? (
        /* ═══ SCHEMA VIEW ═══ */
        <div className="max-w-4xl mx-auto px-4 pb-8">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="h-[3px] bg-red-600" />
            <div className="p-8">
              <h2 className="text-xl font-light text-gray-900 mb-6" style={{ letterSpacing: "-0.02em" }}>Datenstruktur — Swiss Invoice (Art. 26 MWSTG)</h2>
              {/* Rate cards */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                {[
                  { rate: "8.1%", label: "Normalsatz", bg: "bg-gray-900", desc: "Services, Restaurants, Alkohol" },
                  { rate: "2.6%", label: "Reduziert", bg: "bg-sky-600", desc: "Lebensmittel, Bücher, Medikamente" },
                  { rate: "3.8%", label: "Sondersatz", bg: "bg-amber-500", desc: "Hotels / Beherbergung" },
                  { rate: "0%", label: "Befreit", bg: "bg-emerald-600", desc: "Exporte, Luftfahrt" },
                ].map(r => (
                  <div key={r.rate} className={`${r.bg} text-white rounded-xl p-4`}>
                    <div className="text-2xl font-bold" style={{ letterSpacing: "-0.02em" }}>{r.rate}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest mt-1 opacity-70">{r.label}</div>
                    <div className="text-[10px] mt-2 opacity-50 leading-relaxed">{r.desc}</div>
                  </div>
                ))}
              </div>
              {/* Required fields */}
              <div className="border border-gray-200 rounded-xl p-5">
                <Label>Pflichtfelder gemäss Art. 26 MWSTG</Label>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3">
                  {[
                    ["Rechnungssteller", "Name, Adresse, MwSt-Nr."],
                    ["Empfänger", "Name, Adresse (Pflicht > CHF 400)"],
                    ["Rechnungsnummer", "Eindeutige Kennung"],
                    ["Datum", "Rechnungsdatum + Leistungsdatum"],
                    ["Positionen", "Beschreibung, Menge, Preis, MwSt-Satz"],
                    ["MwSt-Desglose", "Brutto, Netto, MwSt pro Gruppe"],
                    ["Gesamtbetrag", "Inkl. + exkl. MwSt + Währung"],
                    ["QR-Zahlteil", "IBAN, Referenz, Betrag (Standard SIX)"],
                  ].map(([field, desc]) => (
                    <div key={field} className="flex items-start gap-2 py-1.5">
                      <div className="mt-1 w-4 h-4 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{field}</div>
                        <div className="text-[11px] text-gray-400">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Key distinctions */}
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="text-[10px] text-amber-600 uppercase tracking-widest font-semibold mb-2">Wichtige Unterscheidung</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">Restaurant</div>
                    <div className="text-gray-500 text-xs">→ 8.1% (Gastronomie)</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">Take Away</div>
                    <div className="text-gray-500 text-xs">→ 2.6% (Lebensmittel)</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">Alkohol</div>
                    <div className="text-gray-500 text-xs">→ Immer 8.1%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ═══ INVOICE VIEW ═══ */
        <div className={`mx-auto pb-8 px-4 ${view === "mobile" ? "max-w-[420px]" : "max-w-4xl"}`}>
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] overflow-hidden" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            {/* Red accent */}
            <div className="h-[3px] bg-red-600" />

            {/* ── HEADER ── */}
            <div className={`${px} pt-8 pb-6`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{iss.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900 tracking-wide truncate">{iss.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono tracking-wider">{iss.mwstNummer}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-400 leading-relaxed">
                    <div>{iss.street}</div>
                    <div>{iss.zip} {iss.city}</div>
                    <div>{iss.country}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <h1 className="text-2xl md:text-[32px] font-extralight text-gray-900 leading-none" style={{ letterSpacing: "-0.03em" }}>Rechnung</h1>
                  <div className="mt-3 space-y-0.5">
                    {[
                      { l: "Nr.", v: invoice.nummer },
                      { l: "Datum", v: formatDate(invoice.datum) },
                      { l: "Leistung", v: formatDate(invoice.leistungsDatum) },
                      { l: "Fällig", v: formatDate(invoice.faelligkeitsDatum), bold: true },
                    ].map(m => (
                      <div key={m.l} className="text-[11px] text-gray-400 flex items-baseline justify-end gap-2">
                        <span className="w-16 text-right">{m.l}</span>
                        <span className={m.bold ? "text-gray-900 font-bold" : "text-gray-600 font-medium"}>{m.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Recipient */}
              <div className="mt-8">
                <Label>Rechnungsempfänger</Label>
                <div className="text-[13px] text-gray-800 leading-relaxed">
                  <div className="font-semibold">{rec.name}</div>
                  {rec.attn && <div className="text-gray-500">{rec.attn}</div>}
                  <div className="text-gray-500">{rec.street}</div>
                  <div className="text-gray-500">{rec.zip} {rec.city}</div>
                  {rec.uid && <div className="text-[11px] text-gray-400 font-mono mt-1">{rec.uid}</div>}
                </div>
              </div>
            </div>

            {/* ── LINE ITEMS ── */}
            <div className={px}>
              {/* Header */}
              <div className={`grid gap-2 py-2.5 border-y-2 border-gray-900 text-[9px] uppercase tracking-[0.12em] text-gray-400 font-semibold select-none ${view === "mobile" ? "grid-cols-12" : "grid-cols-12"}`}>
                {view !== "mobile" && <div className="col-span-1">Pos</div>}
                <div className={view === "mobile" ? "col-span-7" : "col-span-5"}>Beschreibung</div>
                {view !== "mobile" && <div className="col-span-1 text-right">Menge</div>}
                {view !== "mobile" && <div className="col-span-2 text-right">Einzelpreis</div>}
                <div className={`${view === "mobile" ? "col-span-2" : "col-span-1"} text-center`}>MwSt</div>
                <div className={`${view === "mobile" ? "col-span-3" : "col-span-2"} text-right`}>Betrag</div>
              </div>
              {/* Rows */}
              {invoice.items.map((item, idx) => (
                <div key={item.id} className={`grid gap-2 py-3 ${idx < invoice.items.length - 1 ? "border-b border-gray-100" : ""} ${view === "mobile" ? "grid-cols-12" : "grid-cols-12"}`}>
                  {view !== "mobile" && <div className="col-span-1 text-[11px] text-gray-300 font-mono pt-0.5">{String(idx+1).padStart(2,"0")}</div>}
                  <div className={view === "mobile" ? "col-span-7" : "col-span-5"}>
                    <div className="text-[12px] md:text-[13px] text-gray-800 font-medium leading-snug">{item.description}</div>
                    {item.detail && <div className="text-[10px] text-gray-400 mt-0.5">{item.detail}</div>}
                    {view === "mobile" && <div className="text-[10px] text-gray-400 mt-0.5">{item.quantity} × {formatCHF(item.unitPrice)}</div>}
                  </div>
                  {view !== "mobile" && <div className="col-span-1 text-right text-[13px] text-gray-500 pt-0.5 tabular-nums">{item.quantity}</div>}
                  {view !== "mobile" && <div className="col-span-2 text-right text-[13px] text-gray-500 pt-0.5 tabular-nums">{formatCHF(item.unitPrice)}</div>}
                  <div className={`${view === "mobile" ? "col-span-2" : "col-span-1"} flex justify-center pt-0.5`}>
                    <MwStBadge code={item.mwstCode} rate={item.mwstRate} />
                  </div>
                  <div className={`${view === "mobile" ? "col-span-3" : "col-span-2"} text-right text-[12px] md:text-[13px] text-gray-900 font-semibold pt-0.5 tabular-nums`}>
                    {formatCHF(item.totalBrutto)}
                  </div>
                </div>
              ))}
            </div>

            {/* ── TOTALS ── */}
            <div className={`${px} mt-3 mb-6`}>
              <div className="flex justify-end">
                <div className={view === "mobile" ? "w-full" : "w-72"}>
                  <div className="flex justify-between py-1.5 text-[12px]">
                    <span className="text-gray-400">Zwischensumme netto</span>
                    <span className="text-gray-600 font-medium tabular-nums">{formatCHF(totalNetto)}</span>
                  </div>
                  {breakdown.map(g => (
                    <div key={g.code} className="flex justify-between items-center py-1 text-[12px]">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <MwStBadge code={g.code} rate={g.rate} />
                        <span>MwSt {fmtPct(g.rate)}</span>
                      </span>
                      <span className="text-gray-500 tabular-nums">{formatCHF(g.mwst)}</span>
                    </div>
                  ))}
                  <div className="border-t-2 border-gray-900 my-2.5" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-semibold">Gesamtbetrag CHF</span>
                    <span className="text-xl md:text-2xl font-bold text-gray-900 tabular-nums" style={{ letterSpacing: "-0.02em" }}>{formatCHF(totalBrutto)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── MWST TABLE ── */}
            <div className={`${px} pb-5`}>
              <div className="bg-gray-50 rounded-lg p-4">
                <Label>MwSt-Zusammenfassung</Label>
                <div className="grid grid-cols-5 gap-3 text-[9px] text-gray-400 font-semibold uppercase tracking-[0.1em] pb-2 border-b border-gray-200">
                  <div>Code</div><div>Satz</div><div className="text-right">Brutto</div><div className="text-right">Netto</div><div className="text-right">MwSt</div>
                </div>
                {breakdown.map(g => (
                  <div key={g.code} className="grid grid-cols-5 gap-3 text-[11px] py-1.5">
                    <div><MwStBadge code={g.code} rate={g.rate} /></div>
                    <div className="text-gray-500 tabular-nums">{fmtPct(g.rate)}</div>
                    <div className="text-right text-gray-500 tabular-nums">{formatCHF(g.brutto)}</div>
                    <div className="text-right text-gray-500 tabular-nums">{formatCHF(g.netto)}</div>
                    <div className="text-right text-gray-800 font-semibold tabular-nums">{formatCHF(g.mwst)}</div>
                  </div>
                ))}
                <div className="grid grid-cols-5 gap-3 text-[11px] pt-2 border-t border-gray-200 font-semibold text-gray-800">
                  <div className="col-span-2">Total</div>
                  <div className="text-right tabular-nums">{formatCHF(totalBrutto)}</div>
                  <div className="text-right tabular-nums">{formatCHF(totalNetto)}</div>
                  <div className="text-right tabular-nums">{formatCHF(totalMwst)}</div>
                </div>
              </div>
            </div>

            {/* ── NOTES ── */}
            <div className={`${px} pb-3`}>
              <p className="text-[11px] text-gray-400 leading-relaxed">{invoice.notes}</p>
            </div>

            {/* ── CUT LINE ── */}
            <div className={`${px}`}>
              <div className="flex items-center gap-2 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="rotate-90 flex-shrink-0">
                  <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
                  <line x1="20" y1="4" x2="8.6" y2="15.4" /><line x1="14.5" y1="12.5" x2="20" y2="20" />
                </svg>
                <div className="flex-1 border-t-2 border-dashed border-gray-200" />
              </div>
            </div>

            {/* ── QR-RECHNUNG ── */}
            <div className={`${px} pb-8`}>
              <div className="border-2 border-gray-900 rounded-sm overflow-hidden">
                <div className={`grid ${view === "mobile" ? "grid-cols-1" : "grid-cols-2"} ${view !== "mobile" ? "divide-x-2 divide-gray-900" : ""}`}>
                  {/* Zahlteil */}
                  <div className="p-4">
                    <div className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3 text-gray-900">Zahlteil</div>
                    <div className={`flex ${view === "mobile" ? "flex-col" : ""} gap-4`}>
                      <QRCode />
                      <div className="text-[10px] space-y-2 flex-1">
                        <div>
                          <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">Konto / Zahlbar an</div>
                          <div className="text-gray-800 font-mono text-[10px]">{iss.iban}</div>
                          <div className="text-gray-700 leading-relaxed">{iss.name}<br/>{iss.street}<br/>{iss.zip} {iss.city}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">Referenz</div>
                          <div className="text-gray-800 font-mono text-[10px]">{invoice.referenz}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">Zahlbar durch</div>
                          <div className="text-gray-700 leading-relaxed">{rec.name}<br/>{rec.street}<br/>{rec.zip} {rec.city}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-4 mt-4 pt-3 border-t border-gray-200">
                      <div>
                        <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">Währung</div>
                        <div className="text-[12px] font-bold text-gray-900">CHF</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">Betrag</div>
                        <div className="text-[12px] font-bold text-gray-900 tabular-nums">{formatCHF(totalBrutto)}</div>
                      </div>
                    </div>
                  </div>
                  {/* Empfangsschein */}
                  <div className={`p-4 ${view === "mobile" ? "border-t-2 border-gray-900" : ""}`}>
                    <div className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3 text-gray-900">Empfangsschein</div>
                    <div className="text-[10px] space-y-2">
                      <div>
                        <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">Konto / Zahlbar an</div>
                        <div className="text-gray-800 font-mono text-[10px]">{iss.iban}</div>
                        <div className="text-gray-700 leading-relaxed">{iss.name}<br/>{iss.zip} {iss.city}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">Referenz</div>
                        <div className="text-gray-800 font-mono text-[10px]">{invoice.referenz}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">Zahlbar durch</div>
                        <div className="text-gray-700 leading-relaxed">{rec.name}<br/>{rec.zip} {rec.city}</div>
                      </div>
                      <div className="flex items-baseline gap-4 pt-2 border-t border-gray-200">
                        <div>
                          <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">Währung</div>
                          <div className="text-[11px] font-bold text-gray-900">CHF</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">Betrag</div>
                          <div className="text-[11px] font-bold text-gray-900 tabular-nums">{formatCHF(totalBrutto)}</div>
                        </div>
                      </div>
                      <div className="pt-3">
                        <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">Annahmestelle</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div className={`${px} py-4 border-t border-gray-100`}>
              <div className={`flex ${view === "mobile" ? "flex-col gap-0.5" : "justify-between"} text-[10px] text-gray-300`}>
                <div>{iss.name} · {iss.mwstNummer}</div>
                <div>{iss.bank} · {iss.iban}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
