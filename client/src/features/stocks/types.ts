/** Options for the live stock quote hook. */
export type UseStockQuoteOptions = {
  refetchIntervalMs?: number
  /** When false, fetches once and relies on cache; use for lazy list cards. */
  enablePolling?: boolean
}
