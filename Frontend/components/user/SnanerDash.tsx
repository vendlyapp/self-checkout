"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  X, Keyboard, ScanLine, Camera, Volume2, VolumeX,
  Minus, Plus, Undo2, Delete, CheckCircle2, Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cartStore";
import { useScannedStoreStore, type StoreInfo } from "@/lib/stores/scannedStoreStore";
import { buildApiUrl } from "@/lib/config/api";
import { devError } from "@/lib/utils/logger";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";
import { formatSwissPriceWithCHF } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Image from "next/image";

// ── Types ────────────────────────────────────────────────────────────────────
interface ProductApiResponse {
  id: string; name: string; description?: string;
  price: number | string; originalPrice?: number | string;
  promotionalPrice?: number | string;
  category?: string; categoryId?: string;
  stock: number | string; sku?: string; barcode?: string; qrCode?: string;
  image?: string; images?: string[];
  isActive?: boolean; isPromotional?: boolean; isOnSale?: boolean;
  isNew?: boolean; isPopular?: boolean; currency?: string; tags?: string[];
  createdAt?: string; updatedAt?: string;
  store: { id: string; name: string; slug: string; logo?: string | null; isOpen?: boolean };
}

type FlashKind = "ok" | "dup" | "error";
type HistoryEntry = { productId: string };
type LastScan = { product: Product; prevQty: number };

// ── WebAudio beep ─────────────────────────────────────────────────────────────
let audioCtx: AudioContext | null = null;
function tone(freq: number, duration: number, delay = 0) {
  try {
    if (!audioCtx) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
    }
    const ctx = audioCtx;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine"; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.2, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t); osc.stop(t + duration + 0.02);
  } catch { /* noop */ }
}

const COOLDOWN_SAME = 5000;
const COOLDOWN_ANY  = 800;
const FLASH_MS      = 600;
const CARD_COMPRESS = 2500;
const CARD_HIDE     = 6000;

// ── Component ─────────────────────────────────────────────────────────────────
export default function SnanerDash() {
  const router = useRouter();
  const { addToCart, updateQuantity, removeFromCart, cartItems } = useCartStore();
  const { store, setStore } = useScannedStoreStore();

  const videoRef   = useRef<HTMLVideoElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const lastCodeRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });
  const lastAnyRef  = useRef<number>(0);

  const [error,      setError]      = useState<string | null>(null);
  const [muted,      setMuted]      = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("scan-mute") === "1" : false
  );
  const [torchOn,    setTorchOn]    = useState(false);
  const [torchOk,    setTorchOk]    = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [recentCodes, setRecentCodes] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("scan-recent") || "[]").slice(0, 3); } catch { return []; }
  });

  const [flash,    setFlash]    = useState<FlashKind | null>(null);
  const [lastScan, setLastScan] = useState<LastScan | null>(null);
  const [cardCompressed, setCardCompressed] = useState(false);
  const [history,  setHistory]  = useState<HistoryEntry[]>([]);

  const flashRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totals = cartItems.reduce(
    (a, { quantity, product }) => ({ count: a.count + quantity, total: a.total + product.price * quantity }),
    { count: 0, total: 0 }
  );

  const liveQty = lastScan
    ? (cartItems.find(i => i.product.id === lastScan.product.id)?.quantity ?? 0)
    : 0;

  useEffect(() => { localStorage.setItem("scan-mute", muted ? "1" : "0"); }, [muted]);

  // ── Feedback ──────────────────────────────────────────────────────────────
  const feedback = useCallback((kind: "hit" | "dup" | "miss") => {
    if (!muted) {
      if (kind === "hit") tone(880, 0.08);
      else if (kind === "dup") { tone(660, 0.04); tone(660, 0.04, 0.1); }
      else tone(330, 0.18);
    }
    if (navigator.vibrate) {
      if (kind === "hit") navigator.vibrate(50);
      else if (kind === "dup") navigator.vibrate(20);
      else navigator.vibrate([30, 40, 30]);
    }
  }, [muted]);

  const triggerFlash = useCallback((kind: FlashKind) => {
    setFlash(kind);
    if (flashRef.current) clearTimeout(flashRef.current);
    flashRef.current = setTimeout(() => setFlash(null), FLASH_MS);
  }, []);

  const showCard = useCallback((product: Product, prevQty: number) => {
    setLastScan({ product, prevQty });
    setCardCompressed(false);
    if (compressRef.current) clearTimeout(compressRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
    compressRef.current = setTimeout(() => setCardCompressed(true), CARD_COMPRESS);
    hideRef.current = setTimeout(() => { setLastScan(null); setCardCompressed(false); }, CARD_HIDE);
    setHistory(h => [{ productId: product.id }, ...h.filter(e => e.productId !== product.id)].slice(0, 3));
  }, []);

  // ── API lookup ────────────────────────────────────────────────────────────
  const processCode = useCallback(async (rawCode: string) => {
    const now = Date.now();
    if (now - lastAnyRef.current < COOLDOWN_ANY) return;
    if (rawCode === lastCodeRef.current.code && now - lastCodeRef.current.at < COOLDOWN_SAME) {
      triggerFlash("dup"); feedback("dup"); return;
    }
    lastCodeRef.current = { code: rawCode, at: now };
    lastAnyRef.current = now;

    try {
      // QR de tienda: URL con /store/[slug] pero sin /product/
      if (rawCode.includes("/store/") && !rawCode.includes("/product/")) {
        const m = rawCode.match(/\/store\/([^/?#]+)/i);
        if (m?.[1]) {
          controlsRef.current?.stop();
          router.push(`/store/${m[1]}`);
          return;
        }
      }

      let productId = rawCode;
      if (rawCode.includes("/product/")) {
        const m = rawCode.match(/\/product\/([a-f0-9-]+)/i);
        if (m?.[1]) productId = m[1];
        else { window.location.href = rawCode; return; }
      }

      const res = await fetch(buildApiUrl(`/api/products/qr/${encodeURIComponent(productId)}`));
      if (!res.ok) throw new Error("not found");
      const { success, data: pd } = await res.json() as { success: boolean; data: ProductApiResponse };
      if (!success || !pd) throw new Error("not found");
      if (!pd.isActive || parseInt(String(pd.stock)) <= 0) throw new Error("unavailable");

      const product: Product = {
        id: pd.id, name: pd.name, description: pd.description || "",
        price: parseFloat(String(pd.price)) || 0,
        originalPrice: pd.originalPrice ? parseFloat(String(pd.originalPrice)) : undefined,
        promotionalPrice: pd.promotionalPrice ? parseFloat(String(pd.promotionalPrice)) : undefined,
        category: pd.category || "", categoryId: pd.categoryId || "",
        stock: parseInt(String(pd.stock)) || 0, sku: pd.sku || "",
        barcode: pd.barcode, qrCode: pd.qrCode,
        image: pd.image, images: pd.images,
        isActive: pd.isActive ?? true, isPromotional: pd.isPromotional || false,
        isOnSale: pd.isOnSale || false, isNew: pd.isNew || false, isPopular: pd.isPopular || false,
        currency: pd.currency || "CHF", tags: pd.tags || [],
        createdAt: pd.createdAt || new Date().toISOString(),
        updatedAt: pd.updatedAt || new Date().toISOString(),
      };

      const storeData: StoreInfo = {
        id: pd.store.id, name: pd.store.name, slug: pd.store.slug,
        logo: pd.store.logo || null, isOpen: pd.store.isOpen ?? true,
      };
      setStore(storeData);

      const prevQty = cartItems.find(i => i.product.id === product.id)?.quantity ?? 0;
      addToCart(product, 1);
      feedback("hit");
      triggerFlash("ok");
      showCard(product, prevQty);

      // Auto-redirect al carrito tras scan exitoso
      setTimeout(() => {
        controlsRef.current?.stop();
        router.push(`/store/${storeData.slug}/cart`);
      }, 900);
    } catch (err) {
      devError("scan error", err);
      feedback("miss");
      triggerFlash("error");
    }
  }, [addToCart, cartItems, feedback, setStore, showCard, triggerFlash]);

  // ── ZXing reader ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        const [{ BrowserMultiFormatReader }, zxingLib] = await Promise.all([
          import("@zxing/browser"),
          import("@zxing/library"),
        ]);
        if (cancelled) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { DecodeHintType, BarcodeFormat } = zxingLib as any;
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,  BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128, BarcodeFormat.QR_CODE,
          BarcodeFormat.CODE_39, BarcodeFormat.ITF,
        ]);
        hints.set(DecodeHintType.TRY_HARDER, true);

        const reader = new BrowserMultiFormatReader(hints);

        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } }, audio: false },
          videoRef.current!,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result: any) => { if (result && !cancelled) processCode(result.getText()); }
        );

        if (cancelled) { controls.stop(); return; }
        controlsRef.current = controls;

        // Torch detection
        const stream = videoRef.current?.srcObject as MediaStream | null;
        const track  = stream?.getVideoTracks()?.[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const caps   = (track as any)?.getCapabilities?.() as { torch?: boolean } | undefined;
        if (caps?.torch) setTorchOk(true);
      } catch (e) {
        devError("zxing start error", e);
        if (!cancelled) setError("Kamera konnte nicht gestartet werden. Bitte Kamerazugriff erlauben.");
      }
    };

    start();

    const onVis = () => {
      if (document.hidden) { controlsRef.current?.stop(); controlsRef.current = null; }
      else if (!controlsRef.current) start();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      document.removeEventListener("visibilitychange", onVis);
      if (flashRef.current) clearTimeout(flashRef.current);
      if (compressRef.current) clearTimeout(compressRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  // processCode se excluye intencionalmente para no reiniciar la cámara
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTorch = useCallback(async () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    const track  = stream?.getVideoTracks()?.[0];
    if (!track) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as any] });
      setTorchOn(t => !t);
    } catch { /* noop */ }
  }, [torchOn]);

  const submitManual = (code: string) => {
    const t = code.trim();
    if (!t) return;
    lastCodeRef.current = { code: "", at: 0 };
    lastAnyRef.current  = 0;
    processCode(t);
    const updated = [t, ...recentCodes.filter(c => c !== t)].slice(0, 3);
    setRecentCodes(updated);
    localStorage.setItem("scan-recent", JSON.stringify(updated));
    setManualCode(""); setManualOpen(false);
  };

  // ── Colours ───────────────────────────────────────────────────────────────
  const cornerColor = flash === "ok" ? "border-green-400" : flash === "error" ? "border-red-400" : flash === "dup" ? "border-orange-400" : "border-white/50";
  const frameRing   = flash === "ok"
    ? "border-green-400 shadow-[0_0_50px_rgba(74,222,128,0.7)]"
    : flash === "error" ? "border-red-400 shadow-[0_0_50px_rgba(248,113,113,0.7)]"
    : flash === "dup"   ? "border-orange-400 shadow-[0_0_40px_rgba(251,146,60,0.6)]"
    : "border-white/30";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black text-white overflow-hidden">

      {/* VIDEO — fullscreen, object-cover */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay playsInline muted
      />

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Flash colour overlay */}
      {flash && (
        <div className={cn(
          "pointer-events-none absolute inset-0 animate-in fade-in duration-150",
          flash === "ok"    && "bg-green-400/15",
          flash === "dup"   && "bg-orange-400/15",
          flash === "error" && "bg-red-400/15",
        )} />
      )}

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          onClick={() => { controlsRef.current?.stop(); router.back(); }}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur active:scale-95 transition-transform"
          aria-label="Schliessen"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
          Barcode scannen
        </span>

        <div className="flex items-center gap-2">
          {torchOk && (
            <button
              onClick={toggleTorch}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full backdrop-blur active:scale-95 transition-transform",
                torchOn ? "bg-[#25D076] text-white" : "bg-white/15"
              )}
              aria-label={torchOn ? "Taschenlampe aus" : "Taschenlampe an"}
            >
              {/* lucide Flashlight not always available — use ScanLine as fallback */}
              <ScanLine className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => setMuted(m => !m)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur active:scale-95 transition-transform"
            aria-label={muted ? "Ton an" : "Ton aus"}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setManualOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur active:scale-95 transition-transform"
            aria-label="Manuell eingeben"
          >
            <Keyboard className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── Viewfinder ── */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-8">
        <div className="relative aspect-[4/3] w-full max-w-sm">
          {/* Frame ring */}
          <div className={cn("absolute inset-0 rounded-3xl border-2 transition-all duration-200", frameRing)} />
          {/* Corner marks */}
          {(["left-0 top-0 border-l-4 border-t-4 rounded-tl-3xl",
             "right-0 top-0 border-r-4 border-t-4 rounded-tr-3xl",
             "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-3xl",
             "right-0 bottom-0 border-r-4 border-b-4 rounded-br-3xl"] as const).map(c => (
            <span key={c} className={cn("absolute h-8 w-8 transition-colors duration-200", cornerColor, c)} />
          ))}
          {/* Scanline */}
          {!flash && (
            <div className="absolute inset-x-0 top-0 h-0.5 overflow-visible rounded-t-3xl">
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#25D076] to-transparent shadow-[0_0_12px_4px_rgba(37,208,118,0.6)] animate-[scanline_2s_ease-in-out_infinite]" />
            </div>
          )}
          {/* Flash icon */}
          {flash && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center animate-in zoom-in-50 fade-in duration-200">
              <div className={cn("grid h-20 w-20 place-items-center rounded-full shadow-2xl",
                flash === "ok"    && "bg-green-500",
                flash === "dup"   && "bg-orange-500",
                flash === "error" && "bg-red-500",
              )}>
                {flash === "ok"    && <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />}
                {flash === "dup"   && <Plus className="h-12 w-12 text-white" strokeWidth={3} />}
                {flash === "error" && <X className="h-12 w-12 text-white" strokeWidth={2.5} />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-4 text-center">
        {error ? (
          <div className="mx-auto max-w-sm rounded-2xl bg-white/10 p-4 backdrop-blur">
            <Camera className="mx-auto mb-2 h-5 w-5" />
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setManualOpen(true)}
              className="mt-3 rounded-lg bg-[#25D076] px-4 py-2 text-sm font-semibold"
            >
              Barcode manuell eingeben
            </button>
          </div>
        ) : (
          <p className="text-sm opacity-80">
            <ScanLine className="mr-1 inline h-4 w-4" />
            Halte den Barcode in den Rahmen
          </p>
        )}

        {/* Scan history chips */}
        {history.length > 0 && (
          <div className="mx-auto mt-3 flex max-w-sm items-center justify-center gap-2 overflow-x-auto">
            {history.map(entry => {
              const item = cartItems.find(i => i.product.id === entry.productId);
              if (!item || item.quantity <= 0) return null;
              return (
                <div key={entry.productId} className={cn(
                  "flex items-center gap-1.5 rounded-full bg-white/15 py-1 pl-1 pr-2 backdrop-blur",
                  lastScan?.product.id === entry.productId && "ring-2 ring-green-400"
                )}>
                  <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-gray-700">
                    {item.product.image && (
                      <Image src={item.product.image} alt="" fill className="object-cover" sizes="24px" />
                    )}
                  </div>
                  <span className="max-w-[5rem] truncate text-xs font-medium">{item.product.name}</span>
                  <span className="rounded-full bg-[#25D076] px-1.5 py-0.5 text-[10px] font-bold">×{item.quantity}</span>
                  <button
                    onClick={() => { removeFromCart(entry.productId); setHistory(h => h.filter(e => e.productId !== entry.productId)); if (lastScan?.product.id === entry.productId) setLastScan(null); }}
                    className="grid h-5 w-5 place-items-center rounded-full bg-black/30"
                    aria-label="Entfernen"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Warenkorb link */}
        <button
          onClick={() => { controlsRef.current?.stop(); router.push(store?.slug ? `/store/${store.slug}/cart` : "/"); }}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-medium backdrop-blur active:scale-95 transition-transform"
        >
          <span>Warenkorb</span>
          {totals.count > 0 && (
            <>
              <span className={cn("rounded-full bg-[#25D076] px-2 py-0.5 text-xs font-bold", flash === "ok" && "animate-in zoom-in-75 duration-200")}>
                {totals.count}
              </span>
              <span className="font-bold">{formatSwissPriceWithCHF(totals.total)}</span>
            </>
          )}
          <span>→</span>
        </button>
      </footer>

      {/* ── Last scan card ── */}
      {lastScan && liveQty > 0 && !cardCompressed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-32 z-20 flex justify-center px-4">
          <div className="pointer-events-auto w-full max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-200 rounded-2xl bg-white p-3 text-gray-900 shadow-card border-l-4 border-l-green-400">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {lastScan.product.image && (
                  <Image src={lastScan.product.image} alt={lastScan.product.name} fill className="object-cover" sizes="48px" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{lastScan.product.name}</p>
                <p className="text-xs text-gray-400">{formatSwissPriceWithCHF(lastScan.product.price)}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-gray-200 p-0.5">
                <button
                  onClick={() => { const q = liveQty - 1; if (q <= 0) { removeFromCart(lastScan.product.id); setLastScan(null); } else updateQuantity(lastScan.product.id, q); }}
                  className="grid h-7 w-7 place-items-center rounded-full hover:bg-gray-100 active:scale-95"
                  aria-label="Weniger"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold tabular-nums">{liveQty}</span>
                <button
                  onClick={() => updateQuantity(lastScan.product.id, liveQty + 1)}
                  className="grid h-7 w-7 place-items-center rounded-full hover:bg-gray-100 active:scale-95"
                  aria-label="Mehr"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <button
              onClick={() => { updateQuantity(lastScan.product.id, lastScan.prevQty); if (lastScan.prevQty <= 0) removeFromCart(lastScan.product.id); setLastScan(null); }}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700"
            >
              <Undo2 className="h-3.5 w-3.5" /> Rückgängig
            </button>
          </div>
        </div>
      )}

      {/* ── Manual numpad ── */}
      {manualOpen && (
        <div className="absolute inset-0 z-30 flex items-end justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-gray-900 shadow-card">
            <h3 className="text-base font-bold">Barcode eingeben</h3>
            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-right font-mono text-xl tabular-nums tracking-wider min-h-7">
                {manualCode || <span className="text-gray-300">0</span>}
              </p>
            </div>
            {recentCodes.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-medium text-gray-400">Zuletzt verwendet</p>
                <div className="flex flex-wrap gap-1.5">
                  {recentCodes.map(c => (
                    <button key={c} onClick={() => setManualCode(c)}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-mono shadow-soft"
                    >{c}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["1","2","3","4","5","6","7","8","9"].map(n => (
                <button key={n}
                  onClick={() => setManualCode(c => c.length < 14 ? c + n : c)}
                  className="h-14 rounded-xl bg-gray-100 text-2xl font-semibold active:bg-[#25D076]/10 active:scale-95 transition-transform"
                >{n}</button>
              ))}
              <button onClick={() => setManualCode(c => c.slice(0, -1))}
                className="grid h-14 place-items-center rounded-xl bg-gray-100 active:bg-[#25D076]/10 active:scale-95 transition-transform"
                aria-label="Löschen"
              ><Delete className="h-5 w-5" /></button>
              <button onClick={() => setManualCode(c => c.length < 14 ? c + "0" : c)}
                className="h-14 rounded-xl bg-gray-100 text-2xl font-semibold active:bg-[#25D076]/10 active:scale-95 transition-transform"
              >0</button>
              <button onClick={() => submitManual(manualCode)}
                disabled={!manualCode}
                className="h-14 rounded-xl bg-[#25D076] text-base font-semibold text-white shadow-soft disabled:opacity-40 active:scale-95 transition-transform"
              >OK</button>
            </div>
            <button onClick={() => { setManualOpen(false); setManualCode(""); }}
              className="mt-3 w-full rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium active:scale-95 transition-transform"
            >Abbrechen</button>
          </div>
        </div>
      )}
    </div>
  );
}
