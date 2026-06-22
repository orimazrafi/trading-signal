/** Central React Query cache keys. */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  health: ['health'] as const,
  watchlists: {
    list: (userId: string) => ['watchlists', userId] as const,
  },
  dashboard: {
    news: ['dashboard', 'news'] as const,
    recommendations: ['dashboard', 'recommendations'] as const,
  },
  stocks: {
    quote: (symbol: string) => ['stocks', 'quote', symbol] as const,
    history: (symbol: string, range: string) => ['stocks', 'history', symbol, range] as const,
  },
} as const
