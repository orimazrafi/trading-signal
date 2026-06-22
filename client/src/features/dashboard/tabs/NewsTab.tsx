import type { NewsFeedProps } from '../components/NewsFeed/types'
import { NewsFeed } from '../components/NewsFeed'

export type NewsTabProps = Pick<NewsFeedProps, 'news' | 'isLoading' | 'error'>

/** Default home tab with the full-width market news feed. */
export function NewsTab({ news, isLoading, error }: NewsTabProps) {
  return <NewsFeed news={news} isLoading={isLoading} error={error} variant="page" />
}
