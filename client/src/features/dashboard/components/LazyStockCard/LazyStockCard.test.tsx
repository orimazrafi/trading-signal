import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { API_BASE_PATH } from '@trading-signal/contracts/apiPath'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mswServer } from '@/test/msw/server'
import {
  getMockIntersectionObservers,
  resetMockIntersectionObservers,
} from '@/test/setupTests'
import { createQueryClientWrapper } from '@/test/testUtils'
import LazyStockCard from './LazyStockCard'

const aaplQuote = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 190.25,
  peRatio: 28,
  sector: 'Technology',
}

describe('LazyStockCard', () => {
  beforeEach(() => {
    resetMockIntersectionObservers()
    mswServer.use(
      http.get(`${API_BASE_PATH}/stock/AAPL`, () => HttpResponse.json(aaplQuote)),
    )
  })

  afterEach(() => {
    cleanup()
    resetMockIntersectionObservers()
  })

  it('defers quote fetching until the card enters the viewport', async () => {
    const { QueryClientWrapper } = createQueryClientWrapper()

    render(
      <QueryClientWrapper>
        <LazyStockCard symbol="AAPL">
          {({ isVisible, isLoading, quote }) => (
            <output aria-label="card status">
              {`${isVisible}:${isLoading}:${quote?.price ?? 'none'}`}
            </output>
          )}
        </LazyStockCard>
      </QueryClientWrapper>,
    )

    expect(screen.getByLabelText('card status').textContent).toBe('false:false:none')

    const observer = getMockIntersectionObservers()[0]
    observer.trigger(true, screen.getByLabelText('card status'))

    await waitFor(() => {
      expect(screen.getByLabelText('card status').textContent).toBe('true:false:190.25')
    })
  })
})
