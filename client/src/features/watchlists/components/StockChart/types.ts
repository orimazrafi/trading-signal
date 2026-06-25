import type { ChartAreaPoint } from '@/features/stocks/lib/chartSeries'
import type { ChartLineOverlay } from '@/features/stocks/lib/chartIndicatorSeries'
import type { ChartOverlayVisibility } from '@/features/stocks/lib/chartOverlayVisibility'

export type ChartPriceClickPayload = {
  price: number
  timeLabel?: string
}

export type StockChartProps = {
  symbol: string
  series: readonly ChartAreaPoint[]
  overlays?: readonly ChartLineOverlay[]
  overlayVisibility?: ChartOverlayVisibility
  isDarkMode?: boolean
  isLoading?: boolean
  isRefreshing?: boolean
  /** When this key changes, the chart refits its visible time range. */
  fitContentKey?: string
  /** Called when the user clicks the chart to pick a price level for an alert. */
  onPriceClick?: (payload: ChartPriceClickPayload) => void
}