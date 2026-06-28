import { useStockQuote } from '@/features/stocks/hooks/useStockQuote'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import type { LazyStockCardProps, LazyStockCardRenderProps } from './types'

/** Delays per-symbol quote fetching until the card scrolls into the viewport. */
function LazyStockCard({ symbol, children, className }: LazyStockCardProps) {
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: '120px 0px',
    freezeOnceVisible: true,
  })

  const shouldFetch = isIntersecting
  const { quote, isLoading, dataUpdatedAt } = useStockQuote(shouldFetch ? symbol : null, {
    enablePolling: false,
  })

  const renderProps: LazyStockCardRenderProps = {
    quote,
    isLoading: shouldFetch && isLoading,
    lastSyncedAtMs: dataUpdatedAt ?? null,
    isVisible: isIntersecting,
  }

  return (
    <div ref={ref} className={className}>
      {children(renderProps)}
    </div>
  )
}

export default LazyStockCard
export type { LazyStockCardProps, LazyStockCardRenderProps }
