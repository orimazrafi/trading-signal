import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import type { StockHistoryRange } from '@/types/stockHistory'
import { fetchStockHistory } from '@/api/stocks'

/** Loads daily OHLCV history for charting via React Query. */
export function useStockHistory(symbol: string | null, range: StockHistoryRange) {
  const historyQuery = useQuery({
    queryKey: queryKeys.stocks.history(symbol ?? '', range),
    queryFn: () => fetchStockHistory(symbol!, range),
    enabled: Boolean(symbol),
    staleTime: 5 * 60_000,
  })

  const queryError = historyQuery.error instanceof Error ? historyQuery.error.message : null

  return {
    history: historyQuery.data ?? null,
    isLoading: historyQuery.isLoading,
    error: queryError,
    reload: () => historyQuery.refetch(),
  }
}
