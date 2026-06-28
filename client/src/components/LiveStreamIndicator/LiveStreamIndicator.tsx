import { formatMinutesSinceSync } from '@/lib/simulatedLivePrice'
import { cn } from '@/lib/utils'
import type { LiveStreamIndicatorProps } from './types'

/** Pulsing badge that shows the chart or price is updating live, with last API sync time. */
function LiveStreamIndicator({
  lastSyncedAtMs,
  label = 'Live chart updates',
  className,
}: LiveStreamIndicatorProps) {
  const minutesSinceSync = lastSyncedAtMs ? formatMinutesSinceSync(lastSyncedAtMs) : null

  return (
    <p
      className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground', className)}
      role="status"
    >
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-positive motion-safe:animate-pulse"
      />
      <span className="text-positive">{label}</span>
      {minutesSinceSync !== null ? (
        <span className="font-normal">
          · API sync {minutesSinceSync} {minutesSinceSync === 1 ? 'min' : 'mins'} ago
        </span>
      ) : null}
    </p>
  )
}

export default LiveStreamIndicator
