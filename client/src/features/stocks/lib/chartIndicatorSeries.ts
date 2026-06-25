import type { LineData, Time } from 'lightweight-charts'
import { MOVING_AVERAGE_PERIODS } from '@/features/stocks/lib/marketDataCalculations'
import type { MarketDataAnalysis } from '@/features/stocks/lib/marketDataCalculations'
import type { ChartAreaPoint } from '@/features/stocks/lib/chartSeries'

/** Supported moving-average overlay keys rendered on the stock chart. */
export const CHART_OVERLAY_KEYS = {
  SMA20: 'sma20',
  SMA50: 'sma50',
  EMA12: 'ema12',
} as const

/** Moving-average overlay key accepted by StockChart. */
export type ChartOverlayKey = (typeof CHART_OVERLAY_KEYS)[keyof typeof CHART_OVERLAY_KEYS]

/** One indicator line series aligned to the price chart time axis. */
export type ChartLineOverlay = {
  key: ChartOverlayKey
  data: readonly LineData<Time>[]
}

/** Returns the last finite value in a numeric indicator series. */
export function getLatestFiniteValue(values: readonly number[]): number | null {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index]

    if (value !== undefined && Number.isFinite(value)) {
      return value
    }
  }

  return null
}

/** Zips price-bar times with indicator values, skipping NaN entries. */
export function toIndicatorLineData(
  priceSeries: readonly ChartAreaPoint[],
  values: readonly number[],
): LineData<Time>[] {
  const length = Math.min(priceSeries.length, values.length)
  const lineData: LineData<Time>[] = []

  for (let index = 0; index < length; index += 1) {
    const value = values[index]
    const pricePoint = priceSeries[index]

    if (value === undefined || pricePoint === undefined || Number.isNaN(value)) {
      continue
    }

    lineData.push({
      time: pricePoint.time,
      value,
    })
  }

  return lineData
}

/** Maps worker analysis output to lightweight-charts line overlays. */
export function buildChartOverlays(
  priceSeries: readonly ChartAreaPoint[],
  analysis: MarketDataAnalysis | null,
): ChartLineOverlay[] {
  if (!analysis || priceSeries.length === 0) {
    return []
  }

  return [
    {
      key: CHART_OVERLAY_KEYS.SMA20,
      data: toIndicatorLineData(priceSeries, analysis.sma20),
    },
    {
      key: CHART_OVERLAY_KEYS.SMA50,
      data: toIndicatorLineData(priceSeries, analysis.sma50),
    },
    {
      key: CHART_OVERLAY_KEYS.EMA12,
      data: toIndicatorLineData(priceSeries, analysis.ema12),
    },
  ]
}

/** Human-readable labels for each moving-average overlay. */
export const CHART_OVERLAY_LABELS: Record<ChartOverlayKey, string> = {
  [CHART_OVERLAY_KEYS.SMA20]: `SMA ${MOVING_AVERAGE_PERIODS.SMA_SHORT}`,
  [CHART_OVERLAY_KEYS.SMA50]: `SMA ${MOVING_AVERAGE_PERIODS.SMA_LONG}`,
  [CHART_OVERLAY_KEYS.EMA12]: `EMA ${MOVING_AVERAGE_PERIODS.EMA_FAST}`,
}
