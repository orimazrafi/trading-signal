import { Button } from '@/components/Button'
import type { AddToWatchlistButtonProps } from './types'

/** Saves or removes a symbol in the active watchlist from news or idea cards. */
function AddToWatchlistButton({
  symbol,
  onAdd,
  onRemove,
  isInWatchlist = false,
  saving = false,
  removing = false,
  watchlistName,
}: AddToWatchlistButtonProps) {
  const watchlistLabel = watchlistName ?? 'watchlist'

  /** Adds the symbol to the active watchlist. */
  const handleAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    void onAdd(symbol)
  }

  /** Removes the symbol from the active watchlist. */
  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!onRemove) {
      return
    }

    void onRemove(symbol)
  }

  if (isInWatchlist && onRemove) {
    return (
      <Button
        type="button"
        variant="danger"
        disabled={removing}
        loading={removing}
        loadingLabel="Removing…"
        onClick={handleRemove}
      >
        Remove from {watchlistLabel}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={saving || isInWatchlist}
      loading={saving}
      loadingLabel="Saving…"
      onClick={handleAdd}
    >
      {isInWatchlist ? `In ${watchlistLabel}` : `Add to ${watchlistLabel}`}
    </Button>
  )
}

export default AddToWatchlistButton
