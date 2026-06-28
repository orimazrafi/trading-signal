import { useSimulatedLivePrice } from '@/hooks/useSimulatedLivePrice'
import type { SimulatedPriceFlashDirection } from '@/lib/simulatedLivePrice'
import { LiveStreamIndicator } from '@/components/LiveStreamIndicator'
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

/** Renders a price with client-side micro-fluctuations and a live-stream label. */
function SimulatedLivePrice({
  price,
  lastSyncedAtMs,
  liveState,
  streamLabel = 'Live price updates',
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
      <p
        className={cn(
          'inline-flex rounded-md px-1.5 py-0.5 text-lg font-semibold transition-colors duration-500',
          flashClassName,
          className,
        )}
      >
        ${displayPrice.toFixed(2)}
      </p>
      <LiveStreamIndicator
        lastSyncedAtMs={lastSyncedAtMs}
        label={streamLabel}
        className={labelClassName}
      />
    </div>
  )
}

export default SimulatedLivePrice
