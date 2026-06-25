import { FeedRefreshButton } from '@/components/FeedRefreshButton'
import type { MarketNewsArticle } from '@/types/news'
import { Badge } from '@/components/Badge'
import { AsyncListPanel } from '@/components/AsyncListPanel'
import { NewsHeadlineRow } from '@/features/dashboard/components/NewsHeadlineRow'
import { sentimentBadgeVariant } from './newsFeedUtils'
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
}: NewsFeedProps) {
  const isLanding = variant === 'landing'

  const title = isLanding ? LANDING_TITLE : MARKET_TITLE
  const description = isLanding ? LANDING_DESCRIPTION : MARKET_DESCRIPTION
  const emptyMessage = isLanding ? LANDING_EMPTY : MARKET_EMPTY
  const panelVariant = isLanding ? 'page' : 'feed'

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
        onRetry={onRefresh}
        getItemKey={(article) => `${article.url}-${article.publishedAt}`}
        renderItem={(article: MarketNewsArticle) => {
          if (isLanding) {
            return <NewsHeadlineRow article={article} />
          }

          return (
            <div className="space-y-2">
              <NewsHeadlineRow article={article} showSymbol />
              <div className="px-1">
                <Badge variant={sentimentBadgeVariant(article.sentiment)} size="sm">
                  {article.sentiment}
                </Badge>
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}

export default NewsFeed
