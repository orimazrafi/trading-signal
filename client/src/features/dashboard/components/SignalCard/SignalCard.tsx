import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { StockLogo } from '@/components/StockLogo'
import {
  changePercentClass,
  formatChangePercent,
  signalActionBadgeVariant,
} from '@/lib/signalUtils'
import {
  DISPLAY_PRICE_DISCLAIMER,
  formatPriceSyncLabel,
} from '@/lib/simulatedLivePrice'
import type { SignalCardProps } from './types'

/** Renders a saved watchlist stock row, optionally selectable. */
function SignalCard({
  signal,
  isSelected = false,
  onSelect,
  onRemove,
  removing = false,
  liveQuoteSyncedAtMs = null,
  className,
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
      className={className}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <StockLogo symbol={signal.symbol} size="md" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">{signal.symbol}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{signal.reason}</p>
          </div>
        </div>
        <Badge variant={signalActionBadgeVariant(signal.action)}>{signal.action}</Badge>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-foreground">
            ${signal.price.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {liveQuoteSyncedAtMs
              ? `${formatPriceSyncLabel(liveQuoteSyncedAtMs)} · ${DISPLAY_PRICE_DISCLAIMER}`
              : 'Saved at snapshot · tap to view chart'}
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
          className="mt-4"
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
