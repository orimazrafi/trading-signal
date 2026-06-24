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

/** Formats a signed percent change for display. */
export function formatChangePercent(changePercent: number): string {
  const sign = changePercent >= 0 ? '+' : ''
  return `${sign}${changePercent.toFixed(2)}%`
}

/** Returns Tailwind classes for a positive or negative price change. */
export function changePercentClass(changePercent: number): string {
  if (changePercent > 0) {
    return 'text-emerald-600 dark:text-emerald-400'
  }

  if (changePercent < 0) {
    return 'text-red-600 dark:text-red-400'
  }

  return 'text-slate-500 dark:text-slate-400'
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
