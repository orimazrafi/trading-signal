const US_EASTERN_TIME_ZONE = 'America/New_York'

const MARKET_WEEKDAY_PART = 'weekday'
const MARKET_HOUR_PART = 'hour'
const MARKET_MINUTE_PART = 'minute'

const MARKET_OPEN_MINUTES = 9 * 60 + 30
const MARKET_CLOSE_MINUTES = 16 * 60

const EASTERN_WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

const MARKET_STATUS_REFRESH_MS = 60_000

/** Eastern-time clock parts used to evaluate regular US equity session hours. */
type EasternClock = {
  weekdayIndex: number
  minutesSinceMidnight: number
}

/** Reads the weekday index and minutes-since-midnight for a date in US Eastern time. */
function readEasternClock(date: Date): EasternClock {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: US_EASTERN_TIME_ZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const weekday = parts.find((part) => part.type === MARKET_WEEKDAY_PART)?.value ?? 'Sun'
  const hour = Number(parts.find((part) => part.type === MARKET_HOUR_PART)?.value ?? 0)
  const minute = Number(parts.find((part) => part.type === MARKET_MINUTE_PART)?.value ?? 0)

  return {
    weekdayIndex: EASTERN_WEEKDAY_INDEX[weekday] ?? 0,
    minutesSinceMidnight: hour * 60 + minute,
  }
}

/** Returns true during regular US equity hours (Mon–Fri, 9:30 AM–4:00 PM ET). */
export function isUSMarketOpen(date: Date = new Date()): boolean {
  const { weekdayIndex, minutesSinceMidnight } = readEasternClock(date)

  if (weekdayIndex === 0 || weekdayIndex === 6) {
    return false
  }

  return (
    minutesSinceMidnight >= MARKET_OPEN_MINUTES && minutesSinceMidnight < MARKET_CLOSE_MINUTES
  )
}

/** Tooltip copy describing regular US market hours. */
export const US_MARKET_HOURS_TOOLTIP =
  'Regular US equity session: Mon–Fri, 9:30 AM–4:00 PM Eastern. Holidays are not included.'

/** Interval for refreshing open/closed state in the UI. */
export const US_MARKET_STATUS_REFRESH_MS = MARKET_STATUS_REFRESH_MS
