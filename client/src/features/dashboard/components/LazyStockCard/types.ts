import type { ReactNode } from 'react'
import type { StockQuote } from '@/types/stock'

export type LazyStockCardRenderProps = {
  quote: StockQuote | null
  isLoading: boolean
  lastSyncedAtMs: number | null
  isVisible: boolean
}

export type LazyStockCardProps = {
  symbol: string
  children: (props: LazyStockCardRenderProps) => ReactNode
  className?: string
}
