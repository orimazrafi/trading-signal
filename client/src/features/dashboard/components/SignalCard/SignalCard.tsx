import type { Signal } from '../../../../types/watchlist'
import { actionBadgeClass } from '../../../../lib/signalUtils'

export type SignalCardProps = {
  signal: Signal
  isSelected?: boolean
  onSelect?: (symbol: string) => void
  onRemove?: (signalId: string) => void
  removing?: boolean
}

/** Renders a saved watchlist stock row, optionally selectable. */
export function SignalCard({
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
    <article
      className={`rounded-xl border p-4 text-left shadow-sm transition ${
        isSelected
          ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-300 dark:border-violet-500 dark:bg-violet-950/30 dark:ring-violet-500/40'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      } ${isInteractive ? 'cursor-pointer hover:border-violet-300 dark:hover:border-violet-500/50' : ''}`}
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
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${actionBadgeClass(signal.action)}`}
        >
          {signal.action}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
        ${signal.price.toFixed(2)}
      </p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Saved price · tap to view chart</p>
      {onRemove ? (
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className="mt-3 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
        >
          {removing ? 'Removing…' : 'Remove'}
        </button>
      ) : null}
    </article>
  )
}
