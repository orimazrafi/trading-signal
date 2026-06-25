import { cn } from '@/lib/utils'
import { useSimulatedLivePrice } from '@/hooks/useSimulatedLivePrice'
import type { SimulatedPriceFlashDirection } from '@/lib/simulatedLivePrice'
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

/** Renders a price with client-side micro-fluctuations and a sync transparency label. */
function SimulatedLivePrice({
  price,
  lastSyncedAtMs,
  className,
  labelClassName,
}: SimulatedLivePriceProps) {
  const { displayPrice, flashDirection, minutesSinceSync } = useSimulatedLivePrice(
    price,
    lastSyncedAtMs,
  )

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
      <p className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', labelClassName)}>
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full bg-warning motion-safe:animate-pulse"
        />
        Simulated live stream (Last sync: {minutesSinceSync}{' '}
        {minutesSinceSync === 1 ? 'min' : 'mins'} ago)
      </p>
    </div>
  )
}

export default SimulatedLivePrice
