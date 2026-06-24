import { SIGNAL_ACTIONS, type SignalAction } from '@/types/watchlist'

const ACTION_BADGE_CLASSES: Record<SignalAction, string> = {
  BUY: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  SELL: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  HOLD: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
}

const SIGNAL_REASONS: Record<SignalAction, string> = {
  BUY: 'PE ratio is within the buy threshold (0–25).',
  SELL: 'Signal indicates sell conditions.',
  HOLD: 'PE ratio is outside the buy threshold; hold position.',
}

const signalActionValues = new Set<string>(Object.values(SIGNAL_ACTIONS))

/** Returns true when value is a known watchlist signal action. */
function isSignalAction(value: string): value is SignalAction {
  return signalActionValues.has(value)
}

/** Returns Tailwind classes for a watchlist signal action badge. */
export function actionBadgeClass(action: SignalAction): string {
  return ACTION_BADGE_CLASSES[action]
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
