import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Card } from '@/components/Card'
import {
  changePercentClass,
  formatChangePercent,
  signalActionBadgeVariant,
} from '@/lib/signalUtils'
import type { SignalCardProps } from './types'

/** Renders a saved watchlist stock row, optionally selectable. */
function SignalCard({
  signal,
  isSelected = false,
  onSelect,
  onRemove,
  removing = false,
}: SignalCardProps) {
  const isInteractive = Boolean(onSelect)

  /** Selects this stock when the card is clicked. */
  const handleClick = () => {
    onSelect?.(signal.symbol)
  }

  /** Selects this stock when Enter or Space is pressed on the card. */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect?.(signal.symbol)
    }
  }

  /** Removes this stock from the current watchlist without selecting it. */
  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onRemove?.(signal.id)
  }

  return (
    <Card
      variant={isSelected ? 'selected' : isInteractive ? 'interactive' : 'default'}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{signal.symbol}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{signal.reason}</p>
        </div>
        <Badge variant={signalActionBadgeVariant(signal.action)}>{signal.action}</Badge>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            ${signal.price.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Saved at snapshot · tap to view chart
          </p>
        </div>
        <p className={`text-sm font-semibold ${changePercentClass(signal.changePercent)}`}>
          {formatChangePercent(signal.changePercent)}
        </p>
      </div>
      {onRemove ? (
        <Button
          type="button"
          variant="danger"
          disabled={removing}
          loading={removing}
          loadingLabel="Removing…"
          onClick={handleRemove}
        >
          Remove
        </Button>
      ) : null}
    </Card>
  )
}

export default SignalCard
