import {
  RECOMMENDATION_ACTIONS,
  type RecommendationAction,
} from '../../../../types/recommendation'

const RECOMMENDATION_BADGE_CLASSES: Record<RecommendationAction, string> = {
  [RECOMMENDATION_ACTIONS.STRONG_BUY]:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  [RECOMMENDATION_ACTIONS.BUY]:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  [RECOMMENDATION_ACTIONS.SELL]:
    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  [RECOMMENDATION_ACTIONS.HOLD]:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
}

/** Returns Tailwind classes for a recommendation action badge. */
export function recommendationBadgeClass(action: RecommendationAction): string {
  return RECOMMENDATION_BADGE_CLASSES[action]
}

/** Formats a recommendation action for display. */
export function formatRecommendationAction(action: RecommendationAction): string {
  return action.replace('_', ' ')
}

/** Formats a source label for factor rows. */
export function formatRecommendationSource(source: string): string {
  return source.charAt(0).toUpperCase() + source.slice(1)
}
