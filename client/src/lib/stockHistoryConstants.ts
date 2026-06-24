import type { StockHistoryRange } from '@/types/stock'

/** Supported dashboard chart lookback windows. */
export const STOCK_HISTORY_RANGES = ['1D', '1W', '1M', '3M', '6M', '1Y'] as const satisfies readonly StockHistoryRange[]
