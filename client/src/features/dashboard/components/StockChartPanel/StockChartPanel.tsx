import { useStockQuote } from '../../../stocks/hooks/useStockQuote'
import { LoadingSpinner } from '../LoadingSpinner'

export type StockChartPanelProps = {
  symbol: string | null
}

/** Shows live quote details and a chart placeholder for the selected symbol. */
export function StockChartPanel({ symbol }: StockChartPanelProps) {
  const { quote, isLoading, error: queryError } = useStockQuote(symbol)

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
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Live quote and price chart</p>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {isLoading ? <LoadingSpinner label="Loading live quote…" /> : null}

        {queryError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {queryError}
          </p>
        ) : null}

        {quote ? (
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Name</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">{quote.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Price</dt>
              <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                ${quote.price.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">P/E ratio</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {quote.peRatio.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Sector</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">{quote.sector}</dd>
            </div>
          </dl>
        ) : null}

        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-600 dark:bg-slate-950/40">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Chart coming soon</p>
          <p className="mt-2 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            Historical price data will appear here. The live quote above refreshes when you select a
            stock.
          </p>
        </div>
      </div>
    </section>
  )
}
