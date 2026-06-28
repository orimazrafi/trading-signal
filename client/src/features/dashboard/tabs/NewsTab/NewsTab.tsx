import { NewsFeed } from '@/features/dashboard/components/NewsFeed'
import { useNewsFeed } from '@/features/dashboard/hooks/useNewsFeed'

/** Dashboard market news tab with live headlines. */
function NewsTab() {
  const { news, isLoading, isRefreshing, isLoadingMore, hasMore, error, reload, loadMore } = useNewsFeed()

  return (
    <NewsFeed
      news={news}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      error={error}
      variant="market"
      onRefresh={() => void reload()}
      onLoadMore={loadMore}
    />
  )
}

export default NewsTab
