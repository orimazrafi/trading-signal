import { memo } from 'react'
import { toAreaSeriesData } from '@/features/stocks/lib/chartSeries'
import { StockChart } from '@/features/watchlists/components/StockChart'
import type { StockPriceChartProps } from './types'

/** Backward-compatible wrapper around the isolated watchlist StockChart component. */
function StockPriceChartComponent({ points, isDarkMode = false }: StockPriceChartProps) {
  const series = toAreaSeriesData(points)
  const symbol = points[0] ? 'chart' : 'empty'

  return <StockChart symbol={symbol} series={series} isDarkMode={isDarkMode} />
}

const StockPriceChart = memo(StockPriceChartComponent)

export default StockPriceChart
