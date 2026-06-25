/** App route paths for navigation and redirects. */
export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  recommendations: '/dashboard/recommendations',
  alerts: '/dashboard/alerts',
  watchlist: '/watchlist',
  watchlistSymbol: (symbol: string) => `/watchlist/${encodeURIComponent(symbol.toUpperCase())}`,
} as const

/** Normalizes a watchlist route symbol param. */
export function normalizeWatchlistSymbolParam(symbol: string | undefined): string | null {
  const normalized = symbol?.trim().toUpperCase() ?? ''
  return normalized.length > 0 ? normalized : null
}
