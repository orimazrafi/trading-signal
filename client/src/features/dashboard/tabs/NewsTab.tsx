import type { NewsFeedProps } from '@/features/dashboard/components/NewsFeed/types'
import { NewsFeed } from '@/features/dashboard/components/NewsFeed'

export type NewsTabProps = Pick<NewsFeedProps, 'news' | 'isLoading' | 'error'>

/** Default home tab with the full-width market news feed. */
function NewsTab({ news, isLoading, error }: NewsTabProps) {
  return <NewsFeed news={news} isLoading={isLoading} error={error} variant="page" />
}

export default NewsTab
