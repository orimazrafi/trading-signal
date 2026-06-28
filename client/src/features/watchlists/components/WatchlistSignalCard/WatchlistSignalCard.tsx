import { SignalCard } from '@/features/dashboard/components/SignalCard'
import { useStockQuote } from '@/features/stocks/hooks/useStockQuote'
import { computeLiveChangePercent } from '@/features/watchlists/lib/liveQuoteChange'
import type { WatchlistSignalCardProps } from './types'

/** Watchlist row that syncs price with the live quote cache and smart polling. */
function WatchlistSignalCard({
  signal,
  isSelected = false,
  onSelect,
  onRemove,
  removing = false,
}: WatchlistSignalCardProps) {
  const { quote, dataUpdatedAt } = useStockQuote(signal.symbol)
  const livePrice = quote?.price ?? signal.price
  const liveChangePercent = quote ? computeLiveChangePercent(signal.price, quote.price) : signal.changePercent

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
      liveQuoteSyncedAtMs={quote ? dataUpdatedAt : null}
    />
  )
}

export default WatchlistSignalCard
