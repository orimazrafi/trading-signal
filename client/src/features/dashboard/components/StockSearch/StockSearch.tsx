import { type FormEvent } from 'react'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { ErrorMessage } from '@/components/ErrorMessage'
import { FormField } from '@/components/FormField'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Panel } from '@/components/Panel'
import { signalActionBadgeVariant } from '@/lib/signalUtils'
import { useSearchStock } from '@/features/stocks/hooks/useSearchStock'
import { useWatchlistSaveFeedback } from '@/features/watchlists/hooks/useWatchlistSaveFeedback'
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
    <Panel
      title="Stock search"
      description="Look up a symbol to get a live quote and recommendation."
      variant="section"
    >
      <form className="space-y-3" onSubmit={handleSearch}>
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
        <div className="mt-4">
          <ErrorMessage message={searchError} />
        </div>
      ) : null}

      {searchResult && searchAction && searchReason ? (
        <Card variant="muted" className="mt-5 shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {searchResult.quote.symbol}
              </h3>
              <p className="text-sm text-muted-foreground">{searchResult.quote.name}</p>
            </div>
            <Badge variant={signalActionBadgeVariant(searchAction)}>{searchAction}</Badge>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Price</dt>
              <dd className="font-semibold text-foreground">
                ${searchResult.quote.price.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">P/E ratio</dt>
              <dd className="font-semibold text-foreground">
                {searchResult.quote.peRatio.toFixed(2)}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Sector</dt>
              <dd className="font-medium text-foreground">
                {searchResult.quote.sector}
              </dd>
            </div>
          </dl>

          <p className="mt-3 text-sm text-muted-foreground">{searchReason}</p>

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
            <p className="mt-2 text-xs text-warning">
              Create or select a custom view before saving.
            </p>
          ) : null}

          {saveError ? (
            <p className="mt-2 text-sm text-destructive">{saveError}</p>
          ) : null}

          {saveSuccess ? (
            <p className="mt-2 text-sm text-positive">{saveSuccess}</p>
          ) : null}
        </Card>
      ) : null}
    </Panel>
  )
}

export default StockSearch
