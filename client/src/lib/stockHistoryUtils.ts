import { isStockHistoryRange as isStockHistoryRangeFromContracts } from '@trading-signal/contracts/stock'
import type { StockHistoryRange } from '@/types/stock'

/** Returns true when value is a supported history range label. */
export function isStockHistoryRange(value: string): value is StockHistoryRange {
  return isStockHistoryRangeFromContracts(value)
}
