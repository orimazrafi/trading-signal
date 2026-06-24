import { useState } from 'react'
import { toast } from '@/components/Toast'
import { useWatchlists } from '@/features/watchlists/hooks/useWatchlists'

/** Exposes a one-click save action targeting the user's active watchlist. */
export function useQuickAddToWatchlist(userId: string) {
  const {
    watchlists,
    activeWatchlistId,
    handleSaveStockToWatchlist,
    saving,
  } = useWatchlists({ userId })

  const [savingSymbol, setSavingSymbol] = useState<string | null>(null)

  const activeWatchlist = watchlists.find((watchlist) => watchlist.id === activeWatchlistId)

  const watchlistSymbols = [
    ...new Set(watchlists.flatMap((watchlist) => watchlist.signals.map((signal) => signal.symbol))),
  ]

  /** Saves a symbol to the active watchlist and surfaces toast feedback. */
  const quickAdd = async (symbol: string) => {
    if (!activeWatchlistId) {
      toast.error('No watchlist available. Create one from the Watchlist tab.')
      return
    }

    setSavingSymbol(symbol)

    try {
      await handleSaveStockToWatchlist(activeWatchlistId, symbol)
      toast.success(`${symbol} added to ${activeWatchlist?.name ?? 'your watchlist'}.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save stock to your watchlist.')
    } finally {
      setSavingSymbol(null)
    }
  }

  return {
    quickAdd,
    saving: saving || savingSymbol !== null,
    savingSymbol,
    watchlistName: activeWatchlist?.name ?? null,
    hasWatchlist: Boolean(activeWatchlistId),
    watchlistSymbols,
  }
}
