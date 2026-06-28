import { isSignalAction, SIGNAL_ACTIONS, type SignalAction } from '@trading-signal/contracts/signal'
import type { BadgeVariant } from '@/lib/badgeVariants'

const SIGNAL_REASONS: Record<SignalAction, string> = {
  BUY: 'PE ratio is within the buy threshold (0–25).',
  SELL: 'Signal indicates sell conditions.',
  HOLD: 'PE ratio is outside the buy threshold; hold position.',
}

/** Maps a watchlist signal action to a shared badge variant. */
export function signalActionBadgeVariant(action: SignalAction): BadgeVariant {
  if (action === SIGNAL_ACTIONS.BUY) {
    return 'positive'
  }

  if (action === SIGNAL_ACTIONS.SELL) {
    return 'negative'
  }

  return 'warning'
}

/** Formats a signed percent change for display. */
export function formatChangePercent(changePercent: number): string {
  const sign = changePercent >= 0 ? '+' : ''
  return `${sign}${changePercent.toFixed(2)}%`
}

/** Returns Tailwind classes for a positive or negative price change. */
export function changePercentClass(changePercent: number): string {
  if (changePercent > 0) {
    return 'text-positive'
  }

  if (changePercent < 0) {
    return 'text-negative'
  }

  return 'text-muted-foreground'
}

/** Maps a server recommendation string to a client signal action. */
export function toSignalAction(recommendation: string): SignalAction {
  const normalized = recommendation.toUpperCase()

  if (isSignalAction(normalized)) {
    return normalized
  }

  if (normalized === 'STRONG_BUY') {
    return SIGNAL_ACTIONS.BUY
  }

  return SIGNAL_ACTIONS.HOLD
}

/** Builds a human-readable reason from the recommendation action. */
export function buildSignalReason(action: SignalAction): string {
  return SIGNAL_REASONS[action]
}

/** Maps a server recommendation string to a human-readable watchlist reason. */
export function buildSignalReasonFromRecommendation(
  recommendation: string,
  changePercent: number,
): string {
  const action = toSignalAction(recommendation)
  const base = buildSignalReason(action)

  if (changePercent === 0) {
    return base
  }

  const sign = changePercent >= 0 ? '+' : ''
  return `${base} Snapshot change: ${sign}${changePercent.toFixed(2)}%.`
}
