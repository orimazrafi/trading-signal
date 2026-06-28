import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { fetchStockHistory } from '@/api/stocks'
import { resolveStockHistoryPlaceholder } from '@/features/stocks/lib/stockHistoryPlaceholder'
import {
  marketDataQueryOptions,
  STOCK_HISTORY_GC_TIME_MS,
  STOCK_HISTORY_STALE_TIME_MS,
} from '@/lib/marketDataQueryOptions'
import { queryErrorHandledMeta } from '@/lib/queryMeta'
import type { StockHistoryRange } from '@/types/stock'

/** Loads daily OHLCV history for charting via React Query. */
export function useStockHistory(symbol: string | null, range: StockHistoryRange) {
  const historyQuery = useQuery({
    queryKey: queryKeys.stocks.history(symbol ?? '', range),
    queryFn: ({ signal }) => fetchStockHistory(symbol!, range, { signal }),
    enabled: Boolean(symbol),
    staleTime: STOCK_HISTORY_STALE_TIME_MS,
    gcTime: STOCK_HISTORY_GC_TIME_MS,
    placeholderData: (previousData, previousQuery) =>
      resolveStockHistoryPlaceholder(previousData, previousQuery, symbol ?? ''),
    ...marketDataQueryOptions,
    meta: queryErrorHandledMeta,
  })

  const queryError = historyQuery.error instanceof Error ? historyQuery.error.message : null

  return {
    history: historyQuery.data ?? null,
    isLoading: historyQuery.isLoading,
    isFetching: historyQuery.isFetching,
    error: queryError,
    reload: () => historyQuery.refetch(),
  }
}
