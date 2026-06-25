/** Formats an ISO timestamp as a compact relative time (e.g. 18M, 10H). */
export function formatTimeAgo(publishedAt: string): string {
  const date = new Date(publishedAt)

  if (Number.isNaN(date.getTime())) {
    return publishedAt
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))

  if (elapsedSeconds < 60) {
    return `${elapsedSeconds}S`
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60)
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}M`
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) {
    return `${elapsedHours}H`
  }

  const elapsedDays = Math.floor(elapsedHours / 24)
  if (elapsedDays < 7) {
    return `${elapsedDays}D`
  }

  return formatPublishedAt(publishedAt)
}

/** Formats an ISO timestamp for display in feeds and history panels. */
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
