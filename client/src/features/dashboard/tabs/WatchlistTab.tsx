import { useMemo, useState } from 'react'
import { toast } from '@/components/Toast'
import type { AuthUser } from '@/types/auth'
import { WatchlistTabs } from '@/features/watchlists/components/WatchlistTabs'
import { useWatchlists } from '@/features/watchlists/hooks/useWatchlists'
import { LoadingSpinner } from '@/features/dashboard/components/LoadingSpinner'
import { SignalCard } from '@/features/dashboard/components/SignalCard'
import { StockChartPanel } from '@/features/dashboard/components/StockChartPanel'
import { StockSearch } from '@/features/dashboard/components/StockSearch'

export type WatchlistTabProps = {
  user: AuthUser
}

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

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-3">
        {watchlistsLoading ? <LoadingSpinner label="Loading your custom views…" /> : null}

        {watchlistError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {watchlistError}
          </p>
        ) : null}

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
          <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-900/40">
            <header className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {activeWatchlist ? activeWatchlist.name : 'Active view'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tap a stock to load its chart
                </p>
              </div>
              {activeWatchlist ? (
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {activeWatchlist.signals.length} saved
                </span>
              ) : null}
            </header>

            {!activeWatchlist ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-slate-600 dark:bg-slate-900">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Create a custom view with the + button above to start saving stocks.
                </p>
              </div>
            ) : activeWatchlist.signals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-slate-600 dark:bg-slate-900">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  No stocks saved yet. Search below or use Add to watchlist on News and Market Ideas.
                </p>
              </div>
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
          </section>

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
