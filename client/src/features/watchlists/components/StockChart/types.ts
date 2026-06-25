import type { ChartAreaPoint } from '@/features/stocks/lib/chartSeries'
import type { ChartLineOverlay } from '@/features/stocks/lib/chartIndicatorSeries'
import type { ChartOverlayVisibility } from '@/features/stocks/lib/chartOverlayVisibility'

export type StockChartProps = {
  symbol: string
  series: readonly ChartAreaPoint[]
  overlays?: readonly ChartLineOverlay[]
  overlayVisibility?: ChartOverlayVisibility
  isDarkMode?: boolean
  isLoading?: boolean
}
