import { Category, VatRate } from './types';

// Categories data
export const CATEGORIES: Category[] = [
  { value: "Früchte", color: "bg-red-50 text-red-700" },
  { value: "Gemüse", color: "bg-orange-50 text-orange-700" },
  { value: "Alle", color: "bg-gray-50 text-gray-700" },
];

// MwSt-Sätze: nur 0%, 2.6% und 8.1% (Auswahl pro Produkt, Werte als % im Formular → DB als Dezimal)
export const VAT_RATES: VatRate[] = [
  { value: "0", label: "0%", color: "text-gray-600" },
  { value: "2.6", label: "2.6%", color: "text-[#25D076]" },
  { value: "8.1", label: "8.1%", color: "text-blue-600" },
];

// Progress steps for save simulation
export const SAVE_PROGRESS_STEPS = [
  { message: "Produktdaten validieren...", duration: 300 },
  { message: "Bilder hochladen...", duration: 600 },
  { message: "QR-Code generieren...", duration: 400 },
  { message: "Katalog aktualisieren...", duration: 500 },
  { message: "Abschliessen...", duration: 200 },
];
