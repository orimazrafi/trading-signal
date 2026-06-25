import { chartTimesEqual, type ChartAreaPoint } from '@/features/stocks/lib/chartSeries'
import type { StockChartProps } from './types'
import {
  chartOverlayVisibilityEqual,
  chartOverlaysFingerprintsEqual,
} from './chartOverlayCompare'

/** Returns true when the chart should show the initial loading skeleton. */
function showsChartSkeleton(props: StockChartProps): boolean {
  return Boolean(props.isLoading) && props.series.length === 0
}

/** Returns true when two area-series snapshots represent the same visible chart data. */
function chartSeriesFingerprintsEqual(
  previous: readonly ChartAreaPoint[],
  next: readonly ChartAreaPoint[],
): boolean {
  if (previous === next) {
    return true
  }

  if (previous.length !== next.length) {
    return false
  }

  if (previous.length === 0) {
    return true
  }

  const previousFirst = previous[0]
  const nextFirst = next[0]
  const previousLast = previous[previous.length - 1]
  const nextLast = next[next.length - 1]

  if (!previousFirst || !nextFirst || !previousLast || !nextLast) {
    return false
  }

  return (
    chartTimesEqual(previousFirst.time, nextFirst.time) &&
    previousFirst.value === nextFirst.value &&
    chartTimesEqual(previousLast.time, nextLast.time) &&
    previousLast.value === nextLast.value
  )
}

/** Compares props that are cheap scalars or simple derived flags. */
function areStaticStockChartPropsEqual(previous: StockChartProps, next: StockChartProps): boolean {
  return (
    previous.symbol === next.symbol &&
    previous.fitContentKey === next.fitContentKey &&
    previous.isDarkMode === next.isDarkMode &&
    previous.isRefreshing === next.isRefreshing &&
    showsChartSkeleton(previous) === showsChartSkeleton(next) &&
    Boolean(previous.onPriceClick) === Boolean(next.onPriceClick)
  )
}

/** Compares props that depend on series snapshots or overlay state. */
function areStockChartDataPropsEqual(previous: StockChartProps, next: StockChartProps): boolean {
  return (
    chartSeriesFingerprintsEqual(previous.series, next.series) &&
    chartOverlaysFingerprintsEqual(previous.overlays, next.overlays) &&
    chartOverlayVisibilityEqual(previous.overlayVisibility, next.overlayVisibility)
  )
}

/** Custom React.memo comparator that avoids redundant lightweight-charts canvas updates. */
export function stockChartPropsAreEqual(
  previous: StockChartProps,
  next: StockChartProps,
): boolean {
  return areStaticStockChartPropsEqual(previous, next) && areStockChartDataPropsEqual(previous, next)
}
