import { RefreshCw } from 'lucide-react'
import type { MarketNewsArticle } from '@/types/news'
import { Badge } from '@/components/Badge'
import { AsyncListPanel } from '@/components/AsyncListPanel'
import { Button } from '@/components/Button'
import { NewsHeadlineRow } from '@/features/dashboard/components/NewsHeadlineRow'
import { AddToWatchlistButton } from '@/features/watchlists/components/AddToWatchlistButton'
import { sentimentBadgeVariant } from './newsFeedUtils'
import type { NewsFeedProps } from './types'

const LANDING_TITLE = 'Industry headlines (live)'
const LANDING_DESCRIPTION = 'Broad market news from multiple sources — tap a headline to read the full article'
const LANDING_EMPTY = 'No headlines available right now. Try refreshing in a moment.'

const WATCHLIST_TITLE = 'Your watchlist news'
const WATCHLIST_DESCRIPTION = 'Headlines for stocks you follow — add symbols to personalize this feed'
const WATCHLIST_EMPTY =
  'No news for your watchlist yet. Add stocks from Market Ideas or search to personalize this feed.'

/** Scrollable market news panel with compact headline rows and external article links. */
function NewsFeed({
  news,
  isLoading,
  error,
  variant = 'panel',
  watchlistSymbols = [],
  onAddToWatchlist,
  savingSymbol,
  watchlistName,
  onRefresh,
}: NewsFeedProps) {
  const isLanding = variant === 'landing'
  const isWatchlist = variant === 'watchlist' || variant === 'page'
  const watchlistSet = new Set(watchlistSymbols)

  const title = isLanding ? LANDING_TITLE : WATCHLIST_TITLE
  const description = isLanding ? LANDING_DESCRIPTION : WATCHLIST_DESCRIPTION
  const emptyMessage = isLanding ? LANDING_EMPTY : WATCHLIST_EMPTY
  const panelVariant = isLanding || variant === 'page' ? 'page' : 'feed'

  return (
    <div className="space-y-3">
      {onRefresh ? (
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onRefresh} aria-label="Refresh headlines">
            <RefreshCw className="mr-2 size-4" aria-hidden="true" />
            Refresh
          </Button>
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

          const onYourWatchlist = watchlistSet.has(article.symbol)

          return (
            <div className="space-y-2">
              <NewsHeadlineRow article={article} showSymbol />
              {isWatchlist ? (
                <div className="flex flex-wrap items-center gap-2 px-1">
                  <Badge variant={sentimentBadgeVariant(article.sentiment)} size="sm">
                    {article.sentiment}
                  </Badge>
                  {onYourWatchlist ? (
                    <Badge variant="accent" size="sm">
                      On your watchlist
                    </Badge>
                  ) : null}
                  {onAddToWatchlist ? (
                    <AddToWatchlistButton
                      symbol={article.symbol}
                      onAdd={onAddToWatchlist}
                      saving={savingSymbol === article.symbol}
                      watchlistName={watchlistName}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        }}
      />
    </div>
  )
}

export default NewsFeed
