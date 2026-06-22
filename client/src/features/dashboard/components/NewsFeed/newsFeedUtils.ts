import type { NewsSentiment } from '../../../../types/news'

/** Returns Tailwind classes for a sentiment badge. */
export function sentimentBadgeClass(sentiment: NewsSentiment): string {
  switch (sentiment) {
    case 'POSITIVE':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
    case 'NEGATIVE':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
    default:
      return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
  }
}

/** Formats an ISO timestamp for display in the feed. */
export function formatPublishedAt(publishedAt: string): string {
  const date = new Date(publishedAt)

  if (Number.isNaN(date.getTime())) {
    return publishedAt
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
