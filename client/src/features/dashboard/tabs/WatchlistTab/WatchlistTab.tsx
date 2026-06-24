import { useMemo, useState } from 'react'
import { ErrorMessage } from '@/components/ErrorMessage'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Panel } from '@/components/Panel'
import { toast } from '@/components/Toast'
import { WatchlistTabs } from '@/features/watchlists/components/WatchlistTabs'
import { useWatchlists } from '@/features/watchlists/hooks/useWatchlists'
import { SignalCard } from '@/features/dashboard/components/SignalCard'
import { StockChartPanel } from '@/features/dashboard/components/StockChartPanel'
import { StockSearch } from '@/features/dashboard/components/StockSearch'
import type { WatchlistTabProps } from './types'

/** Watchlist tab with custom views, stock search, and chart panel on selection. */
function WatchlistTab({ user }: WatchlistTabProps) {
  const {
    watchlists,
    activeWatchlistId,
    setActiveWatchlistId,
    loading: watchlistsLoading,
    creating,
    saving,
    removing,
    error: watchlistError,
    handleCreateWatchlist,
    handleSaveStockToWatchlist,
    handleRemoveStockFromWatchlist,
  } = useWatchlists({ userId: user.userId })

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)

  const activeWatchlist = useMemo(
    () => watchlists.find((watchlist) => watchlist.id === activeWatchlistId) ?? null,
    [watchlists, activeWatchlistId],
  )

  /** Selects a watchlist stock and loads its chart panel. */
  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol)
  }

  /** Saves a searched stock into the active custom view. */
  const handleSaveStock = async (symbol: string) => {
    if (!activeWatchlistId) {
      throw new Error('Select a custom view before saving a stock.')
    }

    await handleSaveStockToWatchlist(activeWatchlistId, symbol)
    setSelectedSymbol(symbol)
  }

  /** Removes a stock from the active custom view. */
  const handleRemoveStock = async (signalId: string, symbol: string) => {
    if (!activeWatchlistId) {
      toast.error('Select a custom view before removing a stock.')
      return
    }

    try {
      await handleRemoveStockFromWatchlist(activeWatchlistId, signalId)
      toast.success(`${symbol} removed from watchlist.`)
      if (selectedSymbol === symbol) {
        setSelectedSymbol(null)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to remove stock from this view.')
    }
  }

  const watchlistDescription = activeWatchlist
    ? `Tap a stock to load its chart · ${activeWatchlist.signals.length} saved`
    : 'Tap a stock to load its chart'

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-3">
        {watchlistsLoading ? <LoadingSpinner label="Loading your custom views…" /> : null}
        {watchlistError ? <ErrorMessage message={watchlistError} /> : null}

        <WatchlistTabs
          watchlists={watchlists}
          activeWatchlistId={activeWatchlistId}
          onSelectWatchlist={setActiveWatchlistId}
          onCreateWatchlist={handleCreateWatchlist}
          creating={creating}
        />
      </section>

      <div className="grid flex-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Panel
            title={activeWatchlist ? activeWatchlist.name : 'Active view'}
            description={watchlistDescription}
            variant="section"
            className="bg-slate-50/80 dark:bg-slate-900/40"
          >
            {!activeWatchlist ? (
              <EmptyState message="Create a custom view with the + button above to start saving stocks." />
            ) : activeWatchlist.signals.length === 0 ? (
              <EmptyState message="No stocks saved yet. Search below or use Add to watchlist on News and Market Ideas." />
            ) : (
              <ul className="space-y-3">
                {activeWatchlist.signals.map((signal) => (
                  <li key={signal.id}>
                    <SignalCard
                      signal={signal}
                      isSelected={selectedSymbol === signal.symbol}
                      onSelect={handleSelectSymbol}
                      onRemove={(signalId) => void handleRemoveStock(signalId, signal.symbol)}
                      removing={removing}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <StockSearch
            activeWatchlistId={activeWatchlistId}
            activeWatchlistName={activeWatchlist?.name}
            saving={saving}
            onSave={handleSaveStock}
          />
        </div>

        <div className="lg:col-span-7">
          <StockChartPanel symbol={selectedSymbol} />
        </div>
      </div>
    </div>
  )
}

export default WatchlistTab
