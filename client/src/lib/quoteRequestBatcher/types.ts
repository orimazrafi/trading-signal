import type { StockQuote } from '@/types/stock'

/** Options for enqueueing a batched stock quote request. */
export type QuoteBatchRequestOptions = {
  signal?: AbortSignal
}

/** Resolves when a symbol's quote is returned from a coalesced batch request. */
export type QuoteBatchWaiter = {
  resolve: (quote: StockQuote) => void
  reject: (error: Error) => void
  signal?: AbortSignal
}
