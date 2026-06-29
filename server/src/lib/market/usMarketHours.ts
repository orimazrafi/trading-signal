const US_EASTERN_TIMEZONE = "America/New_York";

const MARKET_OPEN_MINUTES = 9 * 60 + 30;
const MARKET_CLOSE_MINUTES = 16 * 60;

/** Returns minutes since midnight for a Date in the given IANA timezone. */
function minutesSinceMidnight(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);

  return hour * 60 + minute;
}

/** Returns weekday (0 = Sunday) for a Date in the given IANA timezone. */
function weekdayInTimeZone(date: Date, timeZone: string): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return weekdayMap[weekday] ?? 0;
}

/** True during regular US equity trading hours (Mon–Fri, 9:30–16:00 ET). */
export function isUSMarketOpen(now: Date): boolean {
  const weekday = weekdayInTimeZone(now, US_EASTERN_TIMEZONE);

  if (weekday === 0 || weekday === 6) {
    return false;
  }

  const minutes = minutesSinceMidnight(now, US_EASTERN_TIMEZONE);
  return minutes >= MARKET_OPEN_MINUTES && minutes < MARKET_CLOSE_MINUTES;
}
