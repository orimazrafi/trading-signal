import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { queryKeys } from '@/api/queryKeys'
import {
  addStockToWatchlist,
  createWatchlist,
  fetchWatchlists,
  removeStockFromWatchlist,
} from '@/api/watchlists'
import {
  mapApiStockToSignal,
  mapApiWatchlist,
  mapApiWatchlists,
} from '@/features/watchlists/lib/watchlistMappers'
import type { UseWatchlistsOptions } from '@/features/watchlists/types'

/** Manages watchlist fetch, active view selection, and create/save mutations. */
export function useWatchlists({ userId = '', enabled = true }: UseWatchlistsOptions = {}) {
  const queryClient = useQueryClient()
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null)

  const watchlistsQuery = useQuery({
    queryKey: queryKeys.watchlists.list(userId),
    queryFn: async () => mapApiWatchlists(await fetchWatchlists(), userId),
    enabled,
  })

  const createMutation = useMutation({
    mutationFn: async (name: string) => mapApiWatchlist(await createWatchlist(name), userId),
  })

  const saveStockMutation = useMutation({
    mutationFn: async ({ watchlistId, symbol }: { watchlistId: string; symbol: string }) =>
      mapApiStockToSignal(await addStockToWatchlist(watchlistId, symbol)),
  })

  const removeStockMutation = useMutation({
    mutationFn: ({ watchlistId, signalId }: { watchlistId: string; signalId: string }) =>
      removeStockFromWatchlist(watchlistId, signalId),
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

  /** Removes a stock from a view and refreshes the list. */
  const handleRemoveStockFromWatchlist = async (watchlistId: string, signalId: string) => {
    await removeStockMutation.mutateAsync({ watchlistId, signalId })
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
    removing: removeStockMutation.isPending,
    error: queryError,
    handleCreateWatchlist,
    handleSaveStockToWatchlist,
    handleRemoveStockFromWatchlist,
    reload: () => watchlistsQuery.refetch(),
  }
}
