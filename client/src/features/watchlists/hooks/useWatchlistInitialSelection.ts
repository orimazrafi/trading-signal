import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UseWatchlistInitialSelectionOptions } from '@/features/watchlists/types'
import { ROUTES } from '@/routes/paths'

/** Returns true when the user switched to a different watchlist tab. */
function didWatchlistChange(
  previousWatchlistId: string | null,
  activeWatchlistId: string | null,
): boolean {
  return previousWatchlistId !== null && previousWatchlistId !== activeWatchlistId
}

/** Returns true when the chart route should fall back to the first saved symbol. */
function shouldSelectFirstSymbol(
  watchlistChanged: boolean,
  selectedSymbol: string | null,
  symbolsInWatchlist: ReadonlySet<string>,
): boolean {
  if (watchlistChanged || !selectedSymbol) {
    return true
  }

  return !symbolsInWatchlist.has(selectedSymbol)
}

/** Selects the first saved stock when opening a view or switching watchlist tabs. */
export function useWatchlistInitialSelection({
  activeWatchlist,
  activeWatchlistId,
  selectedSymbol,
  watchlistsLoading,
}: UseWatchlistInitialSelectionOptions): void {
  const navigate = useNavigate()
  const previousWatchlistIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (watchlistsLoading || !activeWatchlist) {
      return
    }

    const firstSymbol = activeWatchlist.signals[0]?.symbol ?? null
    const watchlistChanged = didWatchlistChange(previousWatchlistIdRef.current, activeWatchlistId)

    previousWatchlistIdRef.current = activeWatchlistId

    if (!firstSymbol) {
      if (selectedSymbol) {
        navigate(ROUTES.watchlist)
      }
      return
    }

    const symbolsInWatchlist = new Set(activeWatchlist.signals.map((signal) => signal.symbol))
    const selectFirst = shouldSelectFirstSymbol(
      watchlistChanged,
      selectedSymbol,
      symbolsInWatchlist,
    )

    if (selectFirst && selectedSymbol !== firstSymbol) {
      navigate(ROUTES.watchlistSymbol(firstSymbol))
    }
  }, [activeWatchlist, activeWatchlistId, navigate, selectedSymbol, watchlistsLoading])
}
