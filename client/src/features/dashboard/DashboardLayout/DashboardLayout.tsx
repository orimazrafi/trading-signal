import { type FormEvent, useMemo, useState } from 'react'
import { AppHeader } from '../../../components/AppHeader'
import type { Signal, SignalAction } from '../../../types/watchlist'
import type { SearchStockResult } from '../../../types/stock'
import { searchStock } from '../../stocks/stockService'
import { WatchlistTabs } from '../../watchlists/components/WatchlistTabs'
import { useWatchlists } from '../../watchlists/hooks/useWatchlists'
import type { DashboardProps } from '../types'

/** Returns Tailwind classes for a recommendation action badge. */
function actionBadgeClass(action: SignalAction): string {
  if (action === 'BUY') {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
  }

  if (action === 'SELL') {
    return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
  }

  return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
}

/** Maps a server recommendation string to a client signal action. */
function toSignalAction(recommendation: string): SignalAction {
  const normalized = recommendation.toUpperCase()

  if (normalized === 'BUY' || normalized === 'SELL' || normalized === 'HOLD') {
    return normalized
  }

  return 'HOLD'
}

/** Builds a human-readable reason from the recommendation action. */
function buildSignalReason(action: SignalAction): string {
  if (action === 'BUY') {
    return 'PE ratio is within the buy threshold (0–25).'
  }

  if (action === 'SELL') {
    return 'Signal indicates sell conditions.'
  }

  return 'PE ratio is outside the buy threshold; hold position.'
}

/** Renders a single saved signal row in the active watchlist. */
function SignalCard({ signal }: { signal: Signal }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm dark:border-slate-700 dark:bg-slate-900">
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
    </article>
  )
}

/** Inline loading spinner for async actions. */
function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <span
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  )
}

/** Signed-in dashboard with watchlist views and stock search. */
export function DashboardLayout({ user, onLogout }: DashboardProps) {
  const {
    watchlists,
    activeWatchlistId,
    setActiveWatchlistId,
    loading: watchlistsLoading,
    creating,
    saving,
    error: watchlistError,
    handleCreateWatchlist,
    handleSaveStockToWatchlist,
  } = useWatchlists({ userId: user.userId })

  const [symbolInput, setSymbolInput] = useState('')
  const [searchResult, setSearchResult] = useState<SearchStockResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const activeWatchlist = useMemo(
    () => watchlists.find((watchlist) => watchlist.id === activeWatchlistId) ?? null,
    [watchlists, activeWatchlistId],
  )

  const searchAction = searchResult ? toSignalAction(searchResult.recommendation) : null

  /** Clears search and save feedback messages before a new action. */
  const clearSearchFeedback = () => {
    setSearchError(null)
    setSaveError(null)
    setSaveSuccess(null)
  }

  /** Runs a stock search and displays the recommendation card. */
  const handleSearch = async (event?: FormEvent) => {
    event?.preventDefault()
    clearSearchFeedback()

    const symbol = symbolInput.trim()
    if (!symbol) {
      setSearchError('Enter a ticker symbol to search.')
      return
    }

    setSearchLoading(true)

    try {
      const result = await searchStock(symbol)
      setSearchResult(result)
      setSymbolInput(result.quote.symbol)
    } catch (err) {
      setSearchResult(null)
      setSearchError(err instanceof Error ? err.message : 'Search failed. Try again.')
    } finally {
      setSearchLoading(false)
    }
  }

  /** Saves the current search result into the active watchlist view. */
  const handleSaveToCurrentView = async () => {
    if (!activeWatchlistId || !searchResult) {
      setSaveError('Select a custom view before saving a stock.')
      return
    }

    clearSearchFeedback()

    try {
      await handleSaveStockToWatchlist(activeWatchlistId, searchResult.quote.symbol)
      setSaveSuccess(`${searchResult.quote.symbol} added to ${activeWatchlist?.name ?? 'your view'}.`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unable to save stock to this view.')
    }
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-4 py-6 text-left">
      <AppHeader email={user.email} onLogout={onLogout} />

      <section className="space-y-3">
        {watchlistsLoading ? (
          <LoadingSpinner label="Loading your custom views…" />
        ) : null}

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

      <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-900/40">
          <header className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {activeWatchlist ? activeWatchlist.name : 'Active view'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Stocks saved in your selected custom view
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
                No stocks saved in this view yet. Use the search bar to find and add stocks!
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {activeWatchlist.signals.map((signal) => (
                <li key={signal.id}>
                  <SignalCard signal={signal} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Stock search</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Look up a symbol to get a live quote and recommendation.
          </p>

          <form className="mt-4 space-y-3" onSubmit={handleSearch}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Symbol
              <input
                type="text"
                value={symbolInput}
                onChange={(event) => setSymbolInput(event.target.value.toUpperCase())}
                placeholder="AAPL, TSLA…"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-violet-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>

            <button
              type="submit"
              disabled={searchLoading}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {searchLoading ? 'Searching…' : 'Search'}
            </button>
          </form>

          {searchLoading ? (
            <div className="mt-4">
              <LoadingSpinner label="Fetching quote and recommendation…" />
            </div>
          ) : null}

          {searchError ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {searchError}
            </p>
          ) : null}

          {searchResult && searchAction ? (
            <article className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {searchResult.quote.symbol}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{searchResult.quote.name}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${actionBadgeClass(searchAction)}`}
                >
                  {searchAction}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Price</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">
                    ${searchResult.quote.price.toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">P/E ratio</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">
                    {searchResult.quote.peRatio.toFixed(2)}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate-500 dark:text-slate-400">Sector</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">
                    {searchResult.quote.sector}
                  </dd>
                </div>
              </dl>

              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {buildSignalReason(searchAction)}
              </p>

              <button
                type="button"
                onClick={() => void handleSaveToCurrentView()}
                disabled={!activeWatchlistId || saving}
                className="mt-4 w-full rounded-lg border border-violet-300 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-800 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-500/40 dark:bg-violet-950/30 dark:text-violet-200 dark:hover:bg-violet-900/40"
              >
                {saving ? 'Saving…' : 'Save to current view'}
              </button>

              {!activeWatchlistId ? (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  Create or select a custom view before saving.
                </p>
              ) : null}

              {saveError ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{saveError}</p>
              ) : null}

              {saveSuccess ? (
                <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">{saveSuccess}</p>
              ) : null}
            </article>
          ) : null}
        </aside>
      </div>
    </main>
  )
}
