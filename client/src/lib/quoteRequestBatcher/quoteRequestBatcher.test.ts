import { API_BASE_PATH } from '@trading-signal/contracts/apiPath'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mswServer } from '@/test/msw/server'
import {
  fetchStockQuoteBatched,
  QUOTE_BATCH_DEBOUNCE_MS,
  quoteRequestBatcher,
} from './quoteRequestBatcher'

const aaplQuote = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 190.25,
  peRatio: 28,
  sector: 'Technology',
}

const msftQuote = {
  symbol: 'MSFT',
  name: 'Microsoft Corp.',
  price: 420.5,
  peRatio: 35,
  sector: 'Technology',
}

/** Reads symbol list from an MSW stocks/quotes POST body. */
function readBatchSymbols(body: unknown): string[] {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return []
  }

  if (!('symbols' in body) || !Array.isArray(body.symbols)) {
    return []
  }

  return body.symbols.filter((symbol): symbol is string => typeof symbol === 'string')
}

describe('quoteRequestBatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mswServer.use(
      http.post(`${API_BASE_PATH}/stocks/quotes`, async ({ request }) => {
        const body = await request.json()
        const symbols = readBatchSymbols(body)
        const quotes = [aaplQuote, msftQuote].filter((quote) => symbols.includes(quote.symbol))
        return HttpResponse.json({ quotes })
      }),
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('coalesces multiple symbol requests into one batch HTTP call', async () => {
    let requestCount = 0
    mswServer.use(
      http.post(`${API_BASE_PATH}/stocks/quotes`, async ({ request }) => {
        requestCount += 1
        const body = await request.json()
        const symbols = readBatchSymbols(body)
        const quotes = [aaplQuote, msftQuote].filter((quote) => symbols.includes(quote.symbol))
        return HttpResponse.json({ quotes })
      }),
    )

    const aaplPromise = fetchStockQuoteBatched('AAPL')
    const msftPromise = fetchStockQuoteBatched('MSFT')

    await vi.advanceTimersByTimeAsync(QUOTE_BATCH_DEBOUNCE_MS)

    await expect(aaplPromise).resolves.toEqual(aaplQuote)
    await expect(msftPromise).resolves.toEqual(msftQuote)
    expect(requestCount).toBe(1)
  })

  it('rejects empty symbols before enqueueing', async () => {
    await expect(fetchStockQuoteBatched('   ')).rejects.toThrow('Stock symbol is required')
  })

  it('exposes a shared singleton batcher instance', () => {
    expect(quoteRequestBatcher).toBeDefined()
  })
})
