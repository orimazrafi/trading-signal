import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import type { FeedRefreshButtonProps } from './types'

/** Refresh control with spin animation and pressed feedback for feed panels. */
function FeedRefreshButton({
  onRefresh,
  isRefreshing = false,
  label = 'Refresh',
  refreshingLabel = 'Refreshing…',
}: FeedRefreshButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      disabled={isRefreshing}
      onClick={onRefresh}
      aria-label={isRefreshing ? refreshingLabel : label}
      aria-busy={isRefreshing}
      className={cn(
        'group shadow-sm transition-all hover:shadow-md active:scale-[0.98]',
        isRefreshing && 'opacity-90',
      )}
    >
      <RefreshCw
        className={cn(
          'mr-2 size-4 transition-transform group-hover:rotate-12',
          isRefreshing && 'animate-spin',
        )}
        aria-hidden="true"
      />
      {isRefreshing ? refreshingLabel : label}
    </Button>
  )
}

export default FeedRefreshButton
