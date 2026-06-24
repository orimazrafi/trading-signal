import { STOCK_HISTORY_RANGES } from '@/lib/stockHistoryConstants'
import type { StockHistoryRange } from '@/types/stock'

const stockHistoryRangeValues = new Set<string>(STOCK_HISTORY_RANGES)

/** Returns true when value is a supported history range label. */
export function isStockHistoryRange(value: string): value is StockHistoryRange {
  return stockHistoryRangeValues.has(value)
}
