import type { IChartApi, ISeriesApi } from 'lightweight-charts'
import { ColorType } from 'lightweight-charts'
import {
  CHART_OVERLAY_KEYS,
  type ChartOverlayKey,
} from '@/features/stocks/lib/chartIndicatorSeries'
import type { ChartThemeColors } from '@/lib/chartTheme'

const OVERLAY_LINE_COLORS: Record<ChartOverlayKey, keyof ChartThemeColors> = {
  [CHART_OVERLAY_KEYS.SMA20]: 'sma20',
  [CHART_OVERLAY_KEYS.SMA50]: 'sma50',
  [CHART_OVERLAY_KEYS.EMA12]: 'ema12',
}

/** Updates chart canvas colors without recreating the lightweight-charts instance. */
export function applyStockChartTheme(
  chart: IChartApi,
  areaSeries: ISeriesApi<'Area'>,
  overlaySeries: Partial<Record<ChartOverlayKey, ISeriesApi<'Line'>>>,
  colors: ChartThemeColors,
): void {
  chart.applyOptions({
    layout: {
      background: { type: ColorType.Solid, color: colors.background },
      textColor: colors.text,
    },
    grid: {
      vertLines: { color: colors.grid },
      horzLines: { color: colors.grid },
    },
  })

  areaSeries.applyOptions({
    lineColor: colors.line,
    topColor: colors.top,
    bottomColor: colors.bottom,
  })

  for (const overlayKey of Object.values(CHART_OVERLAY_KEYS)) {
    const lineSeries = overlaySeries[overlayKey]

    if (!lineSeries) {
      continue
    }

    const colorKey = OVERLAY_LINE_COLORS[overlayKey]
    lineSeries.applyOptions({ color: colors[colorKey] })
  }
}
