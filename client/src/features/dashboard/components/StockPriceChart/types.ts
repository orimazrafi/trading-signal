import type { StockHistoryPoint } from '@/types/stock'

export type StockPriceChartProps = {
  points: StockHistoryPoint[]
  isDarkMode?: boolean
}
