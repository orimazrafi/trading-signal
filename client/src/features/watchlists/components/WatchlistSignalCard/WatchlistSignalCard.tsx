import { LazyStockCard } from '@/features/dashboard/components/LazyStockCard'
import { SignalCard } from '@/features/dashboard/components/SignalCard'
import { computeLiveChangePercent } from '@/features/watchlists/lib/liveQuoteChange'
import type { WatchlistSignalCardProps } from './types'

/** Watchlist row that lazy-loads quotes and syncs price with smart polling when visible. */
function WatchlistSignalCard({
  signal,
  isSelected = false,
  onSelect,
  onRemove,
  removing = false,
}: WatchlistSignalCardProps) {
  return (
    <LazyStockCard symbol={signal.symbol} enablePolling>
      {({ quote, lastSyncedAtMs }) => {
        const livePrice = quote?.price ?? signal.price
        const liveChangePercent = quote
          ? computeLiveChangePercent(signal.price, quote.price)
          : signal.changePercent

        return (
          <SignalCard
            signal={{
              ...signal,
              price: livePrice,
              changePercent: liveChangePercent,
            }}
            isSelected={isSelected}
            onSelect={onSelect}
            onRemove={onRemove}
            removing={removing}
            liveQuoteSyncedAtMs={quote ? lastSyncedAtMs : null}
          />
        )
      }}
    </LazyStockCard>
  )
}

export default WatchlistSignalCard
