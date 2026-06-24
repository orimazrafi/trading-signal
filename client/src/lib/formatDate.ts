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
