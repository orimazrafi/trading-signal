import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Panel } from '@/components/Panel'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePrefersDarkMode } from '@/hooks/usePrefersDarkMode'
import { useStockHistory } from '@/features/stocks/hooks/useStockHistory'
import { useStockQuote } from '@/features/stocks/hooks/useStockQuote'
import { STOCK_HISTORY_RANGES } from '@/lib/stockHistoryConstants'
import { isStockHistoryRange } from '@/lib/stockHistoryUtils'
import type { StockHistoryRange } from '@/types/stock'
import { StockPriceChart } from '@/features/dashboard/components/StockPriceChart'
import { mergeLivePriceIntoHistory } from '@/features/dashboard/components/StockPriceChart/stockChartUtils'
import type { StockChartPanelProps } from './types'

/** Shows live quote details and a historical price chart for the selected symbol. */
function StockChartPanel({ symbol }: StockChartPanelProps) {
  const [range, setRange] = useState<StockHistoryRange>('1M')
  const isDarkMode = usePrefersDarkMode()
  const { quote, isLoading: isQuoteLoading, error: quoteError } = useStockQuote(symbol)
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

    return mergeLivePriceIntoHistory(history.points, quote.price, range)
  }, [history?.points, quote?.price, range])

  if (!symbol) {
    return (
      <EmptyState
        message="Select a stock from your watchlist to view its chart and live quote."
        className="flex min-h-[24rem] flex-1 flex-col items-center justify-center bg-card px-6 py-10"
      />
    )
  }

  return (
    <Panel
      title={symbol}
      description="Live quote and historical price chart"
      variant="feed"
      className="min-h-[24rem] max-h-none flex-1"
      bodyClassName="flex flex-col gap-4"
    >
      {isQuoteLoading && !quote ? <LoadingSpinner label="Loading live quote…" /> : null}
      {quoteError ? <ErrorMessage message={quoteError} /> : null}

      {quote ? (
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium text-foreground">{quote.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Live price</dt>
            <dd className="text-lg font-semibold text-foreground">
              ${quote.price.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">P/E ratio</dt>
            <dd className="font-medium text-foreground">
              {quote.peRatio > 0 ? quote.peRatio.toFixed(2) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Sector</dt>
            <dd className="font-medium text-foreground">{quote.sector}</dd>
          </div>
        </dl>
      ) : null}

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Range</span>
        <Select
          value={range}
          onValueChange={(value) => {
            if (isStockHistoryRange(value)) {
              setRange(value)
            }
          }}
        >
          <SelectTrigger className="w-[7rem]" aria-label="Chart range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STOCK_HISTORY_RANGES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-h-[16rem] flex-1 flex-col rounded-xl border border-border bg-muted/40 p-2">
        {isHistoryLoading ? <LoadingSpinner label="Loading price history…" /> : null}
        {historyError ? <ErrorMessage message={historyError} /> : null}

        {!isHistoryLoading && !historyError && chartPoints.length > 0 ? (
          <StockPriceChart points={chartPoints} isDarkMode={isDarkMode} />
        ) : null}

        {!isHistoryLoading && !historyError && history?.points.length === 0 ? (
          <EmptyState
            message="No historical data available for this range."
            variant="plain"
            className="flex flex-1 items-center justify-center"
          />
        ) : null}
      </div>
    </Panel>
  )
}

export default StockChartPanel
