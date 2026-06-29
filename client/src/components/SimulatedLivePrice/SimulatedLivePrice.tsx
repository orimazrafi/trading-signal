import { LiveStreamIndicator } from '@/components/LiveStreamIndicator'
import { useSimulatedLivePrice } from '@/hooks/useSimulatedLivePrice'
import {
  DISPLAY_PRICE_DISCLAIMER,
  type SimulatedPriceFlashDirection,
} from '@/lib/simulatedLivePrice'
import { cn } from '@/lib/utils'
import type { SimulatedLivePriceProps } from './types'

/** Maps a simulated tick direction to Tailwind flash colors. */
function classNameForFlashDirection(direction: SimulatedPriceFlashDirection): string {
  switch (direction) {
    case 'up':
      return 'bg-positive-muted text-positive'
    case 'down':
      return 'bg-destructive/10 text-destructive'
    default:
      return 'text-foreground'
  }
}

/** Renders a price with client-side micro-fluctuations and a delayed-data disclaimer. */
function SimulatedLivePrice({
  price,
  lastSyncedAtMs,
  liveState,
  className,
  labelClassName,
}: SimulatedLivePriceProps) {
  const internalLiveState = useSimulatedLivePrice(
    liveState ? null : price,
    liveState ? null : lastSyncedAtMs,
  )
  const { displayPrice, flashDirection } = liveState ?? internalLiveState

  if (displayPrice === null) {
    return null
  }

  const flashClassName = classNameForFlashDirection(flashDirection)

  return (
    <div className="space-y-1">
      <p className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span
          className={cn(
            'inline-flex rounded-md px-1.5 py-0.5 text-lg font-semibold transition-colors duration-500',
            flashClassName,
            className,
          )}
        >
          ${displayPrice.toFixed(2)}
        </span>
        <span className={cn('text-xs font-normal text-muted-foreground', labelClassName)}>
          {DISPLAY_PRICE_DISCLAIMER}
        </span>
      </p>
      <LiveStreamIndicator lastSyncedAtMs={lastSyncedAtMs} />
    </div>
  )
}

export default SimulatedLivePrice
