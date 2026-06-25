import { useCallback, useMemo, useState } from 'react'
import { toast } from '@/components/Toast'
import { useWatchlists } from '@/features/watchlists/hooks/useWatchlists'

/** Exposes quick save/remove actions targeting the user's active watchlist. */
export function useQuickAddToWatchlist(userId: string) {
  const {
    watchlists,
    activeWatchlistId,
    handleSaveStockToWatchlist,
    handleRemoveStockFromWatchlist,
    saving,
    removing,
  } = useWatchlists({ userId })

  const [pendingSymbol, setPendingSymbol] = useState<string | null>(null)

  const activeWatchlist = useMemo(
    () => watchlists.find((watchlist) => watchlist.id === activeWatchlistId) ?? null,
    [watchlists, activeWatchlistId],
  )

  /** Returns true when the symbol is already saved in the active watchlist. */
  const isSymbolInActiveWatchlist = useCallback(
    (symbol: string) =>
      activeWatchlist?.signals.some((signal) => signal.symbol === symbol) ?? false,
    [activeWatchlist],
  )

  /** Saves a symbol to the active watchlist and surfaces toast feedback. */
  const quickAdd = async (symbol: string) => {
    if (!activeWatchlistId) {
      toast.error('No watchlist available. Create one from the Watchlist tab.')
      return
    }

    if (isSymbolInActiveWatchlist(symbol)) {
      return
    }

    setPendingSymbol(symbol)

    try {
      await handleSaveStockToWatchlist(activeWatchlistId, symbol)
      toast.success(`${symbol} added to ${activeWatchlist?.name ?? 'your watchlist'}.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save stock to your watchlist.')
    } finally {
      setPendingSymbol(null)
    }
  }

  /** Removes a symbol from the active watchlist and surfaces toast feedback. */
  const quickRemove = async (symbol: string) => {
    if (!activeWatchlistId) {
      return
    }

    const signal = activeWatchlist?.signals.find((item) => item.symbol === symbol)

    if (!signal) {
      return
    }

    setPendingSymbol(symbol)

    try {
      await handleRemoveStockFromWatchlist(activeWatchlistId, signal.id)
      toast.success(`${symbol} removed from ${activeWatchlist?.name ?? 'your watchlist'}.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to remove stock from your watchlist.')
    } finally {
      setPendingSymbol(null)
    }
  }

  return {
    quickAdd,
    quickRemove,
    isSymbolInActiveWatchlist,
    saving: saving || removing || pendingSymbol !== null,
    savingSymbol: pendingSymbol,
    watchlistName: activeWatchlist?.name ?? null,
    hasWatchlist: Boolean(activeWatchlistId),
  }
}
