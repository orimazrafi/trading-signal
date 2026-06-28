const API_BASE_PATH = '/api/v1'

export const E2E_TEST_PASSWORD = 'e2e-test-password-12'

/** Builds a unique email for isolated E2E runs. */
export function createE2eEmail(label: string): string {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `${label}-${suffix}@e2e.test`
}

/** Registers a user through the API and returns credentials. */
export async function signupViaApi(
  request: { post: (url: string, options: { data: { email: string; password: string } }) => Promise<{ ok: () => boolean }> },
  email: string,
  password = E2E_TEST_PASSWORD,
): Promise<void> {
  const response = await request.post(`${API_BASE_PATH}/auth/signup`, {
    data: { email, password },
  })

  if (!response.ok()) {
    throw new Error(`E2E signup failed for ${email}`)
  }
}

/** Creates a price alert with an explicit baseline so tests avoid live market data. */
export async function createAlertViaApi(
  request: {
    post: (
      url: string,
      options: {
        data: {
          symbol: string
          thresholdPercent: number
          emailEnabled: boolean
          baselinePrice: number
        }
      },
    ) => Promise<{ ok: () => boolean }>
  },
  symbol: string,
): Promise<void> {
  const response = await request.post(`${API_BASE_PATH}/price-alerts`, {
    data: {
      symbol,
      thresholdPercent: 2,
      emailEnabled: false,
      baselinePrice: 100,
    },
  })

  if (!response.ok()) {
    throw new Error(`E2E alert create failed for ${symbol}`)
  }
}

/** Returns true when the server can resolve a stock search (Finnhub or cache available). */
export async function canResolveStockSearch(
  request: { get: (url: string) => Promise<{ ok: () => boolean }> },
  symbol: string,
): Promise<boolean> {
  const response = await request.get(`${API_BASE_PATH}/stocks/${symbol}/search`)
  return response.ok()
}

/** Adds a symbol to the user's first watchlist through the API. */
export async function addStockToDefaultWatchlistViaApi(
  request: {
    get: (url: string) => Promise<{ ok: () => boolean; json: () => Promise<unknown> }>
    post: (url: string, options: { data: { symbol: string } }) => Promise<{ ok: () => boolean }>
  },
  symbol: string,
): Promise<void> {
  const watchlistsResponse = await request.get(`${API_BASE_PATH}/watchlists`)

  if (!watchlistsResponse.ok()) {
    throw new Error('Unable to load watchlists during E2E setup')
  }

  const payload = await watchlistsResponse.json()

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('watchlists' in payload) ||
    !Array.isArray(payload.watchlists) ||
    payload.watchlists.length === 0
  ) {
    throw new Error('No watchlists available during E2E setup')
  }

  const firstWatchlist = payload.watchlists[0]

  if (
    typeof firstWatchlist !== 'object' ||
    firstWatchlist === null ||
    !('id' in firstWatchlist) ||
    typeof firstWatchlist.id !== 'string'
  ) {
    throw new Error('Invalid watchlist payload during E2E setup')
  }

  const saveResponse = await request.post(`${API_BASE_PATH}/watchlists/${firstWatchlist.id}/stocks`, {
    data: { symbol },
  })

  if (!saveResponse.ok()) {
    throw new Error(`Unable to save ${symbol} to watchlist during E2E setup`)
  }
}

export const MOCK_AAPL_QUOTE = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 190.25,
  peRatio: 28,
  sector: 'Technology',
} as const

export const MOCK_AAPL_HISTORY = {
  symbol: 'AAPL',
  interval: '1d',
  range: '1M',
  points: [
    {
      time: '2026-05-24',
      open: 185,
      high: 192,
      low: 184,
      close: 190,
      volume: 50_000_000,
    },
    {
      time: '2026-06-24',
      open: 189,
      high: 191,
      low: 188,
      close: 190.25,
      volume: 45_000_000,
    },
  ],
} as const

/** Stubs browser-facing stock quote/history calls so chart tests avoid vendor rate limits. */
export async function mockAaplChartData(page: {
  route: (
    pattern: string,
    handler: (route: {
      request: () => { url: () => string }
      fulfill: (options: { json: unknown }) => Promise<void>
    }) => Promise<void>,
  ) => Promise<void>
}): Promise<void> {
  await page.route('**/api/v1/stock/AAPL**', async (route) => {
    const url = route.request().url()

    if (url.includes('/history')) {
      await route.fulfill({ json: MOCK_AAPL_HISTORY })
      return
    }

    await route.fulfill({ json: MOCK_AAPL_QUOTE })
  })
}
