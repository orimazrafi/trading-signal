import { NewsFeed } from '@/features/dashboard/components/NewsFeed'
import type { NewsTabProps } from './types'

/** Default home tab with the full-width watchlist news feed. */
function NewsTab(props: NewsTabProps) {
  return <NewsFeed {...props} variant="page" />
}

export default NewsTab
