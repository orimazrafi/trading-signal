const SECONDS_PER_DAY = 86_400

/** Unix seconds at the start of the current calendar year (UTC). */
export function resolveYearToDateFromSeconds(nowMs = Date.now()): number {
  const year = new Date(nowMs).getUTCFullYear()
  return Math.floor(Date.UTC(year, 0, 1) / 1000)
}

/** Whole-day count from Jan 1 through today, inclusive. */
export function resolveYearToDateDayCount(nowMs = Date.now()): number {
  const from = resolveYearToDateFromSeconds(nowMs)
  const to = Math.floor(nowMs / 1000)
  return Math.max(1, Math.ceil((to - from) / SECONDS_PER_DAY) + 1)
}
