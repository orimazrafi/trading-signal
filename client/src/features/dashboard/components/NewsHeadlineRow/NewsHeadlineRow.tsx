import { formatTimeAgo } from '@/lib/formatDate'
import type { NewsHeadlineRowProps } from './types'

/** Compact headline row with source, relative time, and external article link. */
function NewsHeadlineRow({ article, showSymbol = false }: NewsHeadlineRowProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="text-foreground/80">{article.source}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={article.publishedAt}>{formatTimeAgo(article.publishedAt)}</time>
        {showSymbol ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{article.symbol}</span>
          </>
        ) : null}
      </div>
      <p className="text-sm font-medium leading-snug text-foreground">{article.headline}</p>
    </a>
  )
}

export default NewsHeadlineRow
