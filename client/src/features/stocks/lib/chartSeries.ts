import type { AreaData, Time, UTCTimestamp } from 'lightweight-charts'
import type { StockHistoryPoint } from '@/types/stock'
import type { StockHistoryRange } from '@/types/stock'

/** Returns true when a number is a unix-second timestamp accepted by Lightweight Charts. */
function isUtcTimestamp(value: number): value is UTCTimestamp {
  return Number.isFinite(value) && value > 1_000_000_000
}

/** Returns true when a lightweight-charts time is a business-day object. */
function isBusinessDayTime(
  time: Time,
): time is { year: number; month: number; day: number } {
  return (
    typeof time === 'object' &&
    time !== null &&
    'year' in time &&
    'month' in time &&
    'day' in time
  )
}

/** Normalizes a lightweight-charts Time value to a stable comparison key. */
export function chartTimeKey(time: Time): string {
  if (typeof time === 'string' || typeof time === 'number') {
    return String(time)
  }

  if (isBusinessDayTime(time)) {
    return `${time.year}-${time.month}-${time.day}`
  }

  return ''
}

/** Returns true when two lightweight-charts time values represent the same bar. */
export function chartTimesEqual(left: Time, right: Time): boolean {
  return chartTimeKey(left) === chartTimeKey(right)
}

/** Maps API history bar time to a lightweight-charts Time value. */
export function toChartTime(time: string | number): Time {
  if (typeof time === 'string') {
    return time
  }

  if (isUtcTimestamp(time)) {
    return time
  }

  throw new Error(`Invalid chart time value: ${time}`)
}

/** Maps OHLCV points to area-series values for Lightweight Charts. */
export function toAreaSeriesData(points: readonly StockHistoryPoint[]): AreaData<Time>[] {
  return points.map((point) => ({
    time: toChartTime(point.time),
    value: point.close,
  }))
}

/** Appends or updates the latest bar so the chart ends at the live quote price. */
export function mergeLivePriceIntoHistory(
  points: readonly StockHistoryPoint[],
  livePrice: number,
  range?: StockHistoryRange,
): StockHistoryPoint[] {
  if (points.length === 0 || livePrice <= 0) {
    return [...points]
  }

  if (range === '1D') {
    const lastPoint = points[points.length - 1]

    if (!lastPoint) {
      return [...points]
    }

    const now = Math.floor(Date.now() / 1000)
    const lastTime = typeof lastPoint.time === 'number' ? lastPoint.time : now
    const nextTime = Math.max(lastTime, now)

    return [
      ...points.slice(0, -1),
      {
        time: nextTime,
        open: lastPoint.open,
        high: Math.max(lastPoint.high, livePrice),
        low: Math.min(lastPoint.low, livePrice),
        close: livePrice,
        volume: lastPoint.volume,
      },
    ]
  }

  const today = new Date().toISOString().slice(0, 10)
  const lastPoint = points[points.length - 1]

  if (!lastPoint) {
    return [...points]
  }

  const existingTodayBar = lastPoint.time === today ? lastPoint : undefined

  return [
    ...(existingTodayBar ? points.slice(0, -1) : points),
    {
      time: today,
      open: existingTodayBar?.open ?? livePrice,
      high: Math.max(existingTodayBar?.high ?? livePrice, livePrice),
      low: Math.min(existingTodayBar?.low ?? livePrice, livePrice),
      close: livePrice,
      volume: existingTodayBar?.volume ?? 0,
    },
  ]
}

/** Lightweight-charts area point passed to the isolated StockChart renderer. */
export type ChartAreaPoint = AreaData<Time>
