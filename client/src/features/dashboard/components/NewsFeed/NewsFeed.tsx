import { useEffect, useState } from 'react'
import { FeedRefreshButton } from '@/components/FeedRefreshButton'
import { AsyncListPanel } from '@/components/AsyncListPanel'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { NewsHeadlineRow } from '@/features/dashboard/components/NewsHeadlineRow'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import type { NewsFeedProps } from './types'

const LANDING_TITLE = 'Industry headlines (live)'
const LANDING_DESCRIPTION = 'Broad market news from multiple sources — tap a headline to read the full article'
const LANDING_EMPTY = 'No headlines available right now. Try refreshing in a moment.'

const MARKET_TITLE = 'Market News'
const MARKET_DESCRIPTION = 'Broad market headlines from multiple sources — tap a headline to read the full article'
const MARKET_EMPTY = 'No headlines available right now. Try refreshing in a moment.'

/** Scrollable market news panel with compact headline rows and external article links. */
function NewsFeed({
  news,
  isLoading,
  error,
  variant = 'market',
  onRefresh,
  isRefreshing = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: NewsFeedProps) {
  const isLanding = variant === 'landing'
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)

  const title = isLanding ? LANDING_TITLE : MARKET_TITLE
  const description = isLanding ? LANDING_DESCRIPTION : MARKET_DESCRIPTION
  const emptyMessage = isLanding ? LANDING_EMPTY : MARKET_EMPTY
  const panelVariant = isLanding ? 'page' : 'feed'

  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    enabled: Boolean(onLoadMore) && hasMore && !isLoading && !isLoadingMore,
    root: scrollRoot,
    freezeOnceVisible: false,
  })

  useEffect(() => {
    if (isIntersecting && hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore()
    }
  }, [hasMore, isIntersecting, isLoadingMore, onLoadMore])

  const listFooter =
    hasMore || isLoadingMore ? (
      <div ref={loadMoreRef} className="flex justify-center py-3">
        {isLoadingMore ? <LoadingSpinner label="Loading more headlines…" /> : null}
      </div>
    ) : null

  return (
    <div className="space-y-3">
      {onRefresh ? (
        <div className="flex justify-end">
          <FeedRefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
        </div>
      ) : null}

      <AsyncListPanel
        title={title}
        description={description}
        items={news}
        isLoading={isLoading}
        error={error}
        emptyMessage={emptyMessage}
        loadingLabel="Loading market news…"
        variant={panelVariant}
        className={isLanding ? undefined : 'max-h-[calc(100svh-13rem)]'}
        bodyClassName={isLanding ? undefined : 'scrollable-feed'}
        bodyRef={setScrollRoot}
        listClassName="space-y-3 pb-2"
        listFooter={listFooter}
        onRetry={onRefresh}
        getItemKey={(article) => `${article.url}-${article.publishedAt}`}
        renderItem={(article) => (
          <NewsHeadlineRow
            article={article}
            showSymbol={!isLanding}
            showSentiment={!isLanding}
          />
        )}
      />
    </div>
  )
}

export default NewsFeed
