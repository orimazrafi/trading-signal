import type { MarketNewsArticle } from '../../../../types/news'
import { formatPublishedAt, sentimentBadgeClass } from './newsFeedUtils'
import type { NewsFeedProps } from './types'

/** Scrollable market news panel with sentiment badges and external article links. */
export function NewsFeed({ news, isLoading, error, variant = 'panel' }: NewsFeedProps) {
  const isPage = variant === 'page'

  return (
    <section
      className={`flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${
        isPage ? 'min-h-[calc(100vh-14rem)] flex-1' : 'max-h-[32rem]'
      }`}
    >
      <header className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Market Sentiment News
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          General market headlines — your first read when opening the app
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent"
              aria-hidden="true"
            />
            <span>Loading market news…</span>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        ) : null}

        {!isLoading && !error && news.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
            No news articles yet. Publish messages to the market news queue to populate this feed.
          </p>
        ) : null}

        {!isLoading && !error && news.length > 0 ? (
          <ul className="space-y-3">
            {news.map((article: MarketNewsArticle) => (
              <li key={`${article.url}-${article.publishedAt}`}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-violet-300 hover:bg-violet-50/60 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-violet-500/40 dark:hover:bg-violet-950/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-violet-700 dark:text-slate-100 dark:group-hover:text-violet-300">
                      {article.headline}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${sentimentBadgeClass(article.sentiment)}`}
                    >
                      {article.sentiment}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {article.source} · {formatPublishedAt(article.publishedAt)}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
