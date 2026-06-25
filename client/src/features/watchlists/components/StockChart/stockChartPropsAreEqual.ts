import { chartTimesEqual, type ChartAreaPoint } from '@/features/stocks/lib/chartSeries'
import type { StockChartProps } from './types'
import {
  chartOverlayVisibilityEqual,
  chartOverlaysFingerprintsEqual,
} from './chartOverlayCompare'

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

/** Custom React.memo comparator that avoids redundant lightweight-charts canvas updates. */
export function stockChartPropsAreEqual(
  previous: StockChartProps,
  next: StockChartProps,
): boolean {
  if (previous.symbol !== next.symbol) {
    return false
  }

  if (previous.isDarkMode !== next.isDarkMode) {
    return false
  }

  const previousShowsSkeleton = previous.isLoading && previous.series.length === 0
  const nextShowsSkeleton = next.isLoading && next.series.length === 0

  if (previousShowsSkeleton !== nextShowsSkeleton) {
    return false
  }

  if (!chartSeriesFingerprintsEqual(previous.series, next.series)) {
    return false
  }

  if (!chartOverlaysFingerprintsEqual(previous.overlays, next.overlays)) {
    return false
  }

  return chartOverlayVisibilityEqual(previous.overlayVisibility, next.overlayVisibility)
}
