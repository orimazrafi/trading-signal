import type { AreaData, Time } from 'lightweight-charts'
import type { StockHistoryPoint } from '@/types/stock'

/** Appends or updates the latest bar so the chart ends at the live quote price. */
export function mergeLivePriceIntoHistory(
  points: StockHistoryPoint[],
  livePrice: number,
  range?: string,
): StockHistoryPoint[] {
  if (points.length === 0 || livePrice <= 0) {
    return points
  }

  if (range === '1D') {
    const lastPoint = points[points.length - 1]
    const now = Math.floor(Date.now() / 1000)

    return [
      ...points.slice(0, -1),
      {
        time: typeof lastPoint.time === 'number' ? now : lastPoint.time,
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

/** Maps API history bar time to a lightweight-charts Time value. */
export function toChartTime(time: string | number): Time {
  if (typeof time === 'string') {
    return time
  }

  // API intraday bars use unix seconds; lightweight-charts accepts these as UTCTimestamp.
  // @ts-expect-error UTCTimestamp is a branded number in lightweight-charts.
  return time
}

/** Maps OHLCV points to area-series values for Lightweight Charts. */
export function toAreaSeriesData(points: StockHistoryPoint[]): AreaData<Time>[] {
  return points.map((point) => ({
    time: toChartTime(point.time),
    value: point.close,
  }))
}
