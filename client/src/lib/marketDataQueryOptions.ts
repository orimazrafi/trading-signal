/** React Query cache durations for market data (quotes, charts, news). */

/** How long stock quotes stay fresh before a background refetch. */
export const STOCK_QUOTE_STALE_TIME_MS = 5 * 60_000

/** How long stock quotes remain in memory after unused. */
export const STOCK_QUOTE_GC_TIME_MS = 30 * 60_000

/** Background refetch interval for live quotes while a chart is open. */
export const STOCK_QUOTE_REFETCH_INTERVAL_MS = 5 * 60_000

/** How long chart history stays fresh per symbol/range. */
export const STOCK_HISTORY_STALE_TIME_MS = 15 * 60_000

/** How long chart history remains in memory after unused. */
export const STOCK_HISTORY_GC_TIME_MS = 60 * 60_000

/** How long the dashboard news feed stays fresh. */
export const MARKET_NEWS_STALE_TIME_MS = 10 * 60_000

/** How long news remains in memory after unused. */
export const MARKET_NEWS_GC_TIME_MS = 30 * 60_000

/** How long recommendations stay fresh. */
export const RECOMMENDATIONS_STALE_TIME_MS = 10 * 60_000

/** How long recommendations remain in memory after unused. */
export const RECOMMENDATIONS_GC_TIME_MS = 30 * 60_000

/** Shared React Query options that minimize repeat market data API calls. */
export const marketDataQueryOptions = {
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
} as const
