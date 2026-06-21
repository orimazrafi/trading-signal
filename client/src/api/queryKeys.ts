/** Central React Query cache keys. */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  health: ['health'] as const,
  watchlists: {
    list: (userId: string) => ['watchlists', userId] as const,
  },
} as const
