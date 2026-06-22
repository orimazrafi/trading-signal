import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { queryKeys } from '../../../api/queryKeys'
import type { UseWatchlistsOptions } from '../types'
import {
  addStockToWatchlist,
  createWatchlist,
  fetchWatchlists,
} from '../../../api/watchlists'

/** Manages watchlist fetch, active view selection, and create/save mutations. */
export function useWatchlists({ userId = '', enabled = true }: UseWatchlistsOptions = {}) {
  const queryClient = useQueryClient()
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null)

  const watchlistsQuery = useQuery({
    queryKey: queryKeys.watchlists.list(userId),
    queryFn: () => fetchWatchlists(userId),
    enabled,
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => createWatchlist(name, userId),
  })

  const saveStockMutation = useMutation({
    mutationFn: ({ watchlistId, symbol }: { watchlistId: string; symbol: string }) =>
      addStockToWatchlist(watchlistId, symbol),
  })

  const watchlists = watchlistsQuery.data ?? []

  const activeWatchlistId = useMemo(() => {
    if (watchlists.length === 0) {
      return null
    }

    if (selectedWatchlistId && watchlists.some((watchlist) => watchlist.id === selectedWatchlistId)) {
      return selectedWatchlistId
    }

    return watchlists[0].id
  }, [watchlists, selectedWatchlistId])

  /** Refetches watchlists after a successful mutation. */
  const refreshWatchlists = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.watchlists.list(userId) })

  /** Creates a view and selects it as the active tab. */
  const handleCreateWatchlist = async (name: string) => {
    const watchlist = await createMutation.mutateAsync(name)
    setSelectedWatchlistId(watchlist.id)
    await refreshWatchlists()
  }

  /** Saves a stock to a view and refreshes the list. */
  const handleSaveStockToWatchlist = async (watchlistId: string, symbol: string) => {
    await saveStockMutation.mutateAsync({ watchlistId, symbol })
    await refreshWatchlists()
  }

  const queryError =
    watchlistsQuery.error instanceof Error ? watchlistsQuery.error.message : null

  return {
    watchlists,
    activeWatchlistId,
    setActiveWatchlistId: setSelectedWatchlistId,
    loading: watchlistsQuery.isLoading,
    creating: createMutation.isPending,
    saving: saveStockMutation.isPending,
    error: queryError,
    handleCreateWatchlist,
    handleSaveStockToWatchlist,
    reload: () => watchlistsQuery.refetch(),
  }
}
