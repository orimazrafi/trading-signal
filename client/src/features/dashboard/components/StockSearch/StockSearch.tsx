import { type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { FormField } from '@/components/FormField'
import { actionBadgeClass } from '@/lib/signalUtils'
import { useSearchStock } from '@/features/stocks/hooks/useSearchStock'
import { useWatchlistSaveFeedback } from '@/features/watchlists/hooks/useWatchlistSaveFeedback'
import { LoadingSpinner } from '@/features/dashboard/components/LoadingSpinner'
import type { StockSearchProps } from './types'

/** Stock lookup form with quote preview and save-to-watchlist action. */
function StockSearch({
  activeWatchlistId,
  activeWatchlistName,
  saving,
  onSave,
}: StockSearchProps) {
  const {
    symbolInput,
    searchResult,
    isLoading,
    searchError,
    searchAction,
    searchReason,
    handleSymbolInputChange,
    handleSearch: runSearch,
  } = useSearchStock()

  const { saveError, saveSuccess, saveSymbol, clearSaveFeedback } = useWatchlistSaveFeedback({
    watchlistId: activeWatchlistId,
    watchlistName: activeWatchlistName,
    onSave,
  })

  /** Clears save feedback and runs a stock search. */
  const handleSearch = async (event?: FormEvent) => {
    clearSaveFeedback()
    await runSearch(event)
  }

  /** Saves the current search result into the active watchlist view. */
  const handleSave = async () => {
    if (!searchResult) {
      return
    }

    await saveSymbol(searchResult.quote.symbol)
  }

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Stock search</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Look up a symbol to get a live quote and recommendation.
      </p>

      <form className="mt-4 space-y-3" onSubmit={handleSearch}>
        <FormField
          label="Symbol"
          value={symbolInput}
          onChange={handleSymbolInputChange}
          placeholder="AAPL, TSLA…"
        />

        <Button type="submit" fullWidth loading={isLoading} loadingLabel="Searching…">
          Search
        </Button>
      </form>

      {isLoading ? (
        <div className="mt-4">
          <LoadingSpinner label="Fetching quote and recommendation…" />
        </div>
      ) : null}

      {searchError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {searchError}
        </p>
      ) : null}

      {searchResult && searchAction && searchReason ? (
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

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{searchReason}</p>

          <div className="mt-4">
            <Button
              type="button"
              fullWidth
              disabled={!activeWatchlistId}
              loading={saving}
              loadingLabel="Saving…"
              onClick={() => void handleSave()}
            >
              Save to current view
            </Button>
          </div>

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
  )
}

export default StockSearch
