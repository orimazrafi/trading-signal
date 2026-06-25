import type { StockHistory } from '@/types/stock'

const STOCK_HISTORY_SYMBOL_QUERY_KEY_INDEX = 2

type HistoryPlaceholderQuery = {
  queryKey: readonly unknown[]
}

/** Keeps the prior range visible while the next range loads for the same symbol. */
export function resolveStockHistoryPlaceholder(
  previousData: StockHistory | undefined,
  previousQuery: HistoryPlaceholderQuery | undefined,
  symbol: string,
): StockHistory | undefined {
  if (!previousData || !previousQuery || !symbol) {
    return undefined
  }

  const previousSymbol = previousQuery.queryKey[STOCK_HISTORY_SYMBOL_QUERY_KEY_INDEX]

  if (previousSymbol !== symbol) {
    return undefined
  }

  return previousData
}
