/** IANA-Zeitzone für Laden-Betrieb (CH); Tagesgrenzen wie im Backend. */
export const SHOP_DAY_TIMEZONE = "Europe/Zurich";

export function calendarDayKeyInTz(date: Date, timeZone: string = SHOP_DAY_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isSameShopCalendarDay(
  orderDate: Date,
  now: Date = new Date(),
  timeZone: string = SHOP_DAY_TIMEZONE
): boolean {
  return calendarDayKeyInTz(orderDate, timeZone) === calendarDayKeyInTz(now, timeZone);
}
