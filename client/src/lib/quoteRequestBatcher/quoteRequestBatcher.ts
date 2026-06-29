import { MAX_STOCK_QUOTES_BATCH_SIZE } from '@trading-signal/contracts/stock'
import { fetchStockQuotes } from '@/api/stocks'
import type { StockQuote } from '@/types/stock'
import type { QuoteBatchRequestOptions, QuoteBatchWaiter } from './types'

/** Debounce window before flushing pending quote symbols into one HTTP batch. */
export const QUOTE_BATCH_DEBOUNCE_MS = 75

/** Rejects waiters when their AbortSignal fires before the batch completes. */
function rejectAbortedWaiters(waiters: QuoteBatchWaiter[], message: string): void {
  for (const waiter of waiters) {
    if (waiter.signal?.aborted) {
      waiter.reject(new Error(message))
    }
  }
}

/** Returns waiters that are still active (not aborted). */
function activeWaiters(waiters: QuoteBatchWaiter[]): QuoteBatchWaiter[] {
  return waiters.filter((waiter) => !waiter.signal?.aborted)
}

/** Coalesces per-symbol quote requests into debounced POST /stocks/quotes calls. */
class QuoteRequestBatcher {
  private waitersBySymbol = new Map<string, QuoteBatchWaiter[]>()
  private flushTimer: ReturnType<typeof setTimeout> | undefined
  private flushInFlight: Promise<void> | null = null

  /** Enqueues a symbol; resolves when the next batch includes its quote. */
  requestQuote(symbol: string, options: QuoteBatchRequestOptions = {}): Promise<StockQuote> {
    const normalized = symbol.trim().toUpperCase()

    if (!normalized) {
      return Promise.reject(new Error('Stock symbol is required'))
    }

    if (options.signal?.aborted) {
      return Promise.reject(new Error('Aborted'))
    }

    return new Promise<StockQuote>((resolve, reject) => {
      const waiter: QuoteBatchWaiter = {
        resolve,
        reject,
        signal: options.signal,
      }

      options.signal?.addEventListener(
        'abort',
        () => {
          reject(new Error('Aborted'))
        },
        { once: true },
      )

      const existing = this.waitersBySymbol.get(normalized) ?? []
      existing.push(waiter)
      this.waitersBySymbol.set(normalized, existing)

      if (this.waitersBySymbol.size >= MAX_STOCK_QUOTES_BATCH_SIZE) {
        void this.flush()
        return
      }

      this.scheduleFlush()
    })
  }

  /** Schedules a debounced flush when the batch is not already pending. */
  private scheduleFlush(): void {
    if (this.flushTimer) {
      return
    }

    this.flushTimer = setTimeout(() => {
      void this.flush()
    }, QUOTE_BATCH_DEBOUNCE_MS)
  }

  /** Sends one batch request and resolves or rejects all pending waiters. */
  private async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = undefined
    }

    if (this.flushInFlight) {
      await this.flushInFlight
      if (this.waitersBySymbol.size > 0) {
        this.scheduleFlush()
      }
      return
    }

    const batch = this.waitersBySymbol
    this.waitersBySymbol = new Map()

    const symbols = [...batch.keys()].filter(
      (symbol) => activeWaiters(batch.get(symbol) ?? []).length > 0,
    )
    if (symbols.length === 0) {
      return
    }

    this.flushInFlight = (async () => {
      try {
        const quotes = await fetchStockQuotes(symbols)
        const quotesBySymbol = new Map(quotes.map((quote) => [quote.symbol.toUpperCase(), quote]))

        for (const symbol of symbols) {
          const waiters = batch.get(symbol) ?? []
          rejectAbortedWaiters(waiters, 'Aborted')

          const active = activeWaiters(waiters)
          const quote = quotesBySymbol.get(symbol)

          for (const waiter of active) {
            if (quote) {
              waiter.resolve(quote)
            } else {
              waiter.reject(new Error(`Quote not found for ${symbol}`))
            }
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Batch quote fetch failed'
        for (const symbol of symbols) {
          const waiters = batch.get(symbol) ?? []
          rejectAbortedWaiters(waiters, 'Aborted')

          for (const waiter of activeWaiters(waiters)) {
            waiter.reject(new Error(message))
          }
        }
      } finally {
        this.flushInFlight = null
      }
    })()

    await this.flushInFlight
  }
}

export const quoteRequestBatcher = new QuoteRequestBatcher()

/** Fetches one stock quote through the shared debounced batch queue. */
export function fetchStockQuoteBatched(
  symbol: string,
  options: QuoteBatchRequestOptions = {},
): Promise<StockQuote> {
  return quoteRequestBatcher.requestQuote(symbol, options)
}
