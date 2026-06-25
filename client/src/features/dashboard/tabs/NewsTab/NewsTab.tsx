import { useNewsFeed } from '@/features/dashboard/hooks/useNewsFeed'
import { NewsFeed } from '@/features/dashboard/components/NewsFeed'

/** Dashboard market news tab with live headlines. */
function NewsTab() {
  const { news, isLoading, isRefreshing, error, reload } = useNewsFeed()

  return (
    <NewsFeed
      news={news}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      variant="market"
      onRefresh={() => void reload()}
    />
  )
}

export default NewsTab
