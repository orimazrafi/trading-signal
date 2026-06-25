import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { fetchStockQuote } from '@/api/stocks'
import {
  marketDataQueryOptions,
  STOCK_QUOTE_GC_TIME_MS,
  STOCK_QUOTE_REFETCH_INTERVAL_MS,
  STOCK_QUOTE_STALE_TIME_MS,
} from '@/lib/marketDataQueryOptions'
import { queryErrorHandledMeta } from '@/lib/queryMeta'
import type { UseStockQuoteOptions } from '@/features/stocks/types'

/** Loads a live stock quote for the given symbol via React Query. */
export function useStockQuote(symbol: string | null, options: UseStockQuoteOptions = {}) {
  const quoteQuery = useQuery({
    queryKey: queryKeys.stocks.quote(symbol ?? ''),
    queryFn: ({ signal }) => fetchStockQuote(symbol!, { signal }),
    enabled: Boolean(symbol),
    staleTime: STOCK_QUOTE_STALE_TIME_MS,
    gcTime: STOCK_QUOTE_GC_TIME_MS,
    refetchInterval: options.refetchIntervalMs ?? STOCK_QUOTE_REFETCH_INTERVAL_MS,
    ...marketDataQueryOptions,
    meta: queryErrorHandledMeta,
  })

  const queryError = quoteQuery.error instanceof Error ? quoteQuery.error.message : null

  return {
    quote: quoteQuery.data ?? null,
    isLoading: quoteQuery.isLoading,
    error: queryError,
    reload: () => quoteQuery.refetch(),
  }
}
