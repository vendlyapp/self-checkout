/**
 * Configuración de marca de la aplicación.
 * Para quitar cualquier referencia a un nombre de producto, deja NEXT_PUBLIC_APP_NAME vacío o no lo definas.
 * Para usar tu propia marca, define en .env.local: NEXT_PUBLIC_APP_NAME=Tu Marca
 */
export const APP_NAME =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_NAME?.trim()) || "";

/** Texto para "cuenta" en login (con o sin marca) */
export const getLoginSubtitle = (): string =>
  APP_NAME ? `Melde dich bei deinem ${APP_NAME}-Konto an` : "Melde dich bei deinem Konto an";

/** Texto para registro (con o sin marca) */
export const getRegisterSubtitle = (): string =>
  APP_NAME ? `Starte deine Reise mit ${APP_NAME}` : "Starte deine Reise – Konto erstellen";

/** Nombre por defecto para tienda/recibo cuando no hay storeName */
export const getDefaultStoreName = (): string => APP_NAME || "Shop";

/** Texto para búsqueda de email de confirmación */
export const getCheckEmailFrom = (): string =>
  APP_NAME ? `Suche nach der E-Mail von ${APP_NAME} oder Supabase` : "Suche nach der Bestätigungs-E-Mail";

/** Texto del footer de copyright */
export const getCopyrightText = (): string =>
  APP_NAME ? `© ${new Date().getFullYear()} ${APP_NAME}. Alle Rechte vorbehalten.` : `© ${new Date().getFullYear()}. Alle Rechte vorbehalten.`;

/** Descripción genérica para meta de super-admin (sin nombre de producto) */
export const getPlatformDescription = (): string =>
  APP_NAME ? `Allgemeine Indikatoren und Leistung der ${APP_NAME}-Plattform.` : "Allgemeine Indikatoren und Leistung der Plattform.";

/** Descripción para página Analytics (super-admin) */
export const getAnalyticsDescription = (): string =>
  APP_NAME ? `Visualisieren Sie wichtige Trends und die Gesamtleistung der ${APP_NAME}-Plattform.` : "Visualisieren Sie wichtige Trends und die Gesamtleistung der Plattform.";
