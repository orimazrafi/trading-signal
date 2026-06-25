import { cn } from '@/lib/utils'
import { US_MARKET_HOURS_TOOLTIP } from '@/lib/usMarketHours'
import { useUSMarketOpen } from '@/hooks/useUSMarketOpen'
import type { MarketStatusIndicatorProps } from './types'

/** Shows whether US equities are in regular trading hours. */
function MarketStatusIndicator({ className = '' }: MarketStatusIndicatorProps) {
  const isOpen = useUSMarketOpen()
  const label = isOpen ? 'Market open' : 'Market closed'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        isOpen ? 'bg-positive-muted text-positive' : 'bg-muted text-muted-foreground',
        className,
      )}
      title={US_MARKET_HOURS_TOOLTIP}
      aria-label={`${label}. ${US_MARKET_HOURS_TOOLTIP}`}
    >
      <span
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          isOpen ? 'bg-positive' : 'bg-muted-foreground',
        )}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}

export default MarketStatusIndicator
