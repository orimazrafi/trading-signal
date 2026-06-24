import { Button } from '@/components/Button'
import type { AddToWatchlistButtonProps } from './types'

/** Saves a symbol to the active watchlist from news or idea cards. */
function AddToWatchlistButton({
  symbol,
  onAdd,
  saving = false,
  disabled = false,
  watchlistName,
}: AddToWatchlistButtonProps) {
  /** Adds the symbol to the active watchlist. */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    void onAdd(symbol)
  }

  const label = watchlistName ? `Add to ${watchlistName}` : 'Add to watchlist'

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={disabled || saving}
      loading={saving}
      loadingLabel="Saving…"
      onClick={handleClick}
    >
      {label}
    </Button>
  )
}

export default AddToWatchlistButton
