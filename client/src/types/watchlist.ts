/** Allowed trading actions for a saved watchlist signal. */
export const SIGNAL_ACTIONS = {
  BUY: 'BUY',
  SELL: 'SELL',
  HOLD: 'HOLD',
} as const

/** Trading recommendation action for a saved signal. */
export type SignalAction = (typeof SIGNAL_ACTIONS)[keyof typeof SIGNAL_ACTIONS]

/** Persisted stock signal shown in a custom dashboard view. */
export interface Signal {
  id: string
  symbol: string
  price: number
  action: SignalAction
  reason: string
  createdAt: string
}

/** User-owned custom dashboard view containing saved signals. */
export interface Watchlist {
  id: string
  name: string
  userId: string
  signals: Signal[]
  createdAt: string
}
