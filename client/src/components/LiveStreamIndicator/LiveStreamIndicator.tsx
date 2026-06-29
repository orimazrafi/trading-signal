import { formatPriceSyncLabel } from '@/lib/simulatedLivePrice'
import { cn } from '@/lib/utils'
import type { LiveStreamIndicatorProps } from './types'

/** Shows when the price was last synced from the API (not a live exchange feed). */
function LiveStreamIndicator({ lastSyncedAtMs, className }: LiveStreamIndicatorProps) {
  if (!lastSyncedAtMs) {
    return null
  }

  return (
    <p className={cn('text-xs text-muted-foreground', className)} role="status">
      {formatPriceSyncLabel(lastSyncedAtMs)}
    </p>
  )
}

export default LiveStreamIndicator
