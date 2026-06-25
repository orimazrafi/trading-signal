import type { BadgeVariant } from '@/lib/badgeVariants'
import { formatPublishedAt, formatTimeAgo } from '@/lib/formatDate'
import type { NewsSentiment } from '@/types/news'

export { formatPublishedAt, formatTimeAgo }

/** Maps a news sentiment label to a shared badge variant. */
export function sentimentBadgeVariant(sentiment: NewsSentiment): BadgeVariant {
  if (sentiment === 'POSITIVE') {
    return 'positive'
  }

  if (sentiment === 'NEGATIVE') {
    return 'negative'
  }

  return 'neutral'
}
