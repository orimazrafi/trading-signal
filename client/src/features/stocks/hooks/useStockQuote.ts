import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { fetchStockQuote } from '@/api/stocks'

type UseStockQuoteOptions = {
  refetchIntervalMs?: number
}

/** Loads a live stock quote for the given symbol via React Query. */
export function useStockQuote(symbol: string | null, options: UseStockQuoteOptions = {}) {
  const quoteQuery = useQuery({
    queryKey: queryKeys.stocks.quote(symbol ?? ''),
    queryFn: () => fetchStockQuote(symbol!),
    enabled: Boolean(symbol),
    refetchInterval: options.refetchIntervalMs,
  })

  const queryError = quoteQuery.error instanceof Error ? quoteQuery.error.message : null

  return {
    quote: quoteQuery.data ?? null,
    isLoading: quoteQuery.isLoading,
    error: queryError,
    reload: () => quoteQuery.refetch(),
  }
}
