import type { BadgeVariant } from '@/lib/badgeVariants'
import {
  RECOMMENDATION_ACTIONS,
  type RecommendationAction,
} from '@/types/recommendation'

/** Maps a recommendation action to a shared badge variant. */
export function recommendationBadgeVariant(action: RecommendationAction): BadgeVariant {
  if (action === RECOMMENDATION_ACTIONS.STRONG_BUY || action === RECOMMENDATION_ACTIONS.BUY) {
    return 'positive'
  }

  if (action === RECOMMENDATION_ACTIONS.SELL) {
    return 'negative'
  }

  return 'warning'
}

/** Formats a recommendation action for display. */
export function formatRecommendationAction(action: RecommendationAction): string {
  return action.replace('_', ' ')
}

/** Formats a source label for factor rows. */
export function formatRecommendationSource(source: string): string {
  return source.charAt(0).toUpperCase() + source.slice(1)
}
