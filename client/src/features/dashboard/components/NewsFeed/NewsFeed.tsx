import type { MarketNewsArticle } from '@/types/news'
import { Badge } from '@/components/Badge'
import { AsyncListPanel } from '@/components/AsyncListPanel'
import { Card } from '@/components/Card'
import { AddToWatchlistButton } from '@/features/watchlists/components/AddToWatchlistButton'
import { formatPublishedAt, sentimentBadgeVariant } from './newsFeedUtils'
import type { NewsFeedProps } from './types'

const EMPTY_MESSAGE =
  'No news for your watchlist yet. Add stocks from Market Ideas or search to personalize this feed.'

/** Scrollable market news panel with sentiment badges and external article links. */
function NewsFeed({
  news,
  isLoading,
  error,
  variant = 'panel',
  watchlistSymbols = [],
  onAddToWatchlist,
  savingSymbol,
  watchlistName,
}: NewsFeedProps) {
  const watchlistSet = new Set(watchlistSymbols)

  return (
    <AsyncListPanel
      title="Watchlist News"
      description="Headlines for stocks on your watchlist — add symbols to personalize this feed"
      items={news}
      isLoading={isLoading}
      error={error}
      emptyMessage={EMPTY_MESSAGE}
      loadingLabel="Loading market news…"
      variant={variant === 'page' ? 'page' : 'feed'}
      getItemKey={(article) => `${article.url}-${article.publishedAt}`}
      renderItem={(article: MarketNewsArticle) => {
        const onYourWatchlist = watchlistSet.has(article.symbol)

        return (
          <Card variant="highlight" className="group shadow-none">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="neutral" size="sm">
                {article.symbol}
              </Badge>
              {onYourWatchlist ? (
                <Badge variant="accent" size="sm">
                  On your watchlist
                </Badge>
              ) : null}
              <Badge variant={sentimentBadgeVariant(article.sentiment)} size="sm">
                {article.sentiment}
              </Badge>
            </div>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary"
            >
              {article.headline}
            </a>
            <p className="mt-2 text-xs text-muted-foreground">
              {article.source} · {formatPublishedAt(article.publishedAt)}
            </p>
            {onAddToWatchlist ? (
              <div className="mt-3">
                <AddToWatchlistButton
                  symbol={article.symbol}
                  onAdd={onAddToWatchlist}
                  saving={savingSymbol === article.symbol}
                  watchlistName={watchlistName}
                />
              </div>
            ) : null}
          </Card>
        )
      }}
    />
  )
}

export default NewsFeed
