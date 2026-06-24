import { useMemo, useState } from 'react'
import { Button } from '@/components/Button'
import { usePrefersDarkMode } from '@/hooks/usePrefersDarkMode'
import { useStockHistory } from '@/features/stocks/hooks/useStockHistory'
import { useStockQuote } from '@/features/stocks/hooks/useStockQuote'
import { STOCK_HISTORY_RANGES, type StockHistoryRange } from '@/types/stockHistory'
import { LoadingSpinner } from '@/features/dashboard/components/LoadingSpinner'
import { StockPriceChart } from '@/features/dashboard/components/StockPriceChart'
import { mergeLivePriceIntoHistory } from '@/features/dashboard/components/StockPriceChart/stockChartUtils'

const QUOTE_REFETCH_MS = 60_000

export type StockChartPanelProps = {
  symbol: string | null
}

/** Shows live quote details and a historical price chart for the selected symbol. */
function StockChartPanel({ symbol }: StockChartPanelProps) {
  const [range, setRange] = useState<StockHistoryRange>('3M')
  const isDarkMode = usePrefersDarkMode()
  const { quote, isLoading: isQuoteLoading, error: quoteError } = useStockQuote(symbol, {
    refetchIntervalMs: QUOTE_REFETCH_MS,
  })
  const {
    history,
    isLoading: isHistoryLoading,
    error: historyError,
  } = useStockHistory(symbol, range)

  const chartPoints = useMemo(() => {
    if (!history?.points) {
      return []
    }

    if (!quote?.price) {
      return history.points
    }

    return mergeLivePriceIntoHistory(history.points, quote.price)
  }, [history?.points, quote?.price])

  if (!symbol) {
    return (
      <section className="flex min-h-[24rem] flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-slate-600 dark:bg-slate-900">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Select a stock from your watchlist to view its chart and live quote.
        </p>
      </section>
    )
  }

  return (
    <section className="flex min-h-[24rem] flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <header className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{symbol}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Live quote and historical price chart
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {isQuoteLoading && !quote ? <LoadingSpinner label="Loading live quote…" /> : null}

        {quoteError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {quoteError}
          </p>
        ) : null}

        {quote ? (
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Name</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">{quote.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Live price</dt>
              <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                ${quote.price.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">P/E ratio</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {quote.peRatio > 0 ? quote.peRatio.toFixed(2) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Sector</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">{quote.sector}</dd>
            </div>
          </dl>
        ) : null}

        <div className="flex flex-wrap gap-1">
          {STOCK_HISTORY_RANGES.map((option) => {
            const isActive = range === option

            return (
              <Button
                key={option}
                variant={isActive ? 'tabActive' : 'tab'}
                onClick={() => setRange(option)}
                aria-current={isActive ? 'true' : undefined}
              >
                {option}
              </Button>
            )
          })}
        </div>

        <div className="flex min-h-[16rem] flex-1 flex-col rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950/40">
          {isHistoryLoading ? <LoadingSpinner label="Loading price history…" /> : null}

          {historyError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {historyError}
            </p>
          ) : null}

          {!isHistoryLoading && !historyError && chartPoints.length > 0 ? (
            <StockPriceChart points={chartPoints} isDarkMode={isDarkMode} />
          ) : null}

          {!isHistoryLoading && !historyError && history?.points.length === 0 ? (
            <p className="flex flex-1 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              No historical data available for this range.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default StockChartPanel
