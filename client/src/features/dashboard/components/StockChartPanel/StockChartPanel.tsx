import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { LiveStreamIndicator } from '@/components/LiveStreamIndicator'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Panel } from '@/components/Panel'
import { SimulatedLivePrice } from '@/components/SimulatedLivePrice'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartPriceAlertDialog } from '@/features/alerts/components/ChartPriceAlertDialog'
import { usePriceAlerts } from '@/features/alerts/hooks/usePriceAlerts'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { useStockHistory } from '@/features/stocks/hooks/useStockHistory'
import { useStockQuote } from '@/features/stocks/hooks/useStockQuote'
import { useWorkerCalculation } from '@/features/stocks/hooks/useWorkerCalculation'
import { buildChartOverlays } from '@/features/stocks/lib/chartIndicatorSeries'
import type { ChartOverlayKey } from '@/features/stocks/lib/chartIndicatorSeries'
import {
  DEFAULT_CHART_OVERLAY_VISIBILITY,
  toggleChartOverlayVisibility,
  type ChartOverlayVisibility,
} from '@/features/stocks/lib/chartOverlayVisibility'
import { mergeLivePriceIntoHistory, sortHistoryPointsByTime, toAreaSeriesData } from '@/features/stocks/lib/chartSeries'
import { useTheme } from '@/features/theme/ThemeProvider'
import { StockChart } from '@/features/watchlists/components/StockChart'
import type { ChartPriceClickPayload } from '@/features/watchlists/components/StockChart/types'
import { useSimulatedLivePrice } from '@/hooks/useSimulatedLivePrice'
import { STOCK_HISTORY_RANGES } from '@/lib/stockHistoryConstants'
import { isStockHistoryRange } from '@/lib/stockHistoryUtils'
import { cn } from '@/lib/utils'
import type { StockHistoryRange } from '@/types/stock'
import type { StockChartPanelProps } from './types'
import ChartIndicatorStrip from './ChartIndicatorStrip'
import ChartOverlayToggles from './ChartOverlayToggles'

/** Shows live quote details and a historical price chart for the selected symbol. */
function StockChartPanel({ symbol }: StockChartPanelProps) {
  const [range, setRange] = useState<StockHistoryRange>('1M')
  const [overlayVisibility, setOverlayVisibility] = useState<ChartOverlayVisibility>(
    DEFAULT_CHART_OVERLAY_VISIBILITY,
  )
  const [chartAlertDraft, setChartAlertDraft] = useState<ChartPriceClickPayload | null>(null)
  const { user } = useAuthContext()
  const { createAlert, creating: isCreatingAlert } = usePriceAlerts()
  const { resolvedDark: isDarkMode } = useTheme()
  const { quote, isLoading: isQuoteLoading, error: quoteError, dataUpdatedAt } = useStockQuote(symbol)
  const {
    history,
    isLoading: isHistoryLoading,
    isFetching: isHistoryFetching,
    error: historyError,
  } = useStockHistory(symbol, range)

  const livePriceState = useSimulatedLivePrice(quote?.price ?? null, dataUpdatedAt ?? null)
  const chartLivePrice = livePriceState.displayPrice ?? quote?.price

  const chartPoints = useMemo(() => {
    if (!history?.points) {
      return []
    }

    if (!chartLivePrice) {
      return sortHistoryPointsByTime(history.points)
    }

    return sortHistoryPointsByTime(
      mergeLivePriceIntoHistory(history.points, chartLivePrice, range),
    )
  }, [history, chartLivePrice, range])

  const chartSeries = useMemo(() => toAreaSeriesData(chartPoints), [chartPoints])

  const workerInput = useMemo(() => {
    if (!chartPoints.length) {
      return null
    }

    return {
      points: chartPoints,
      peRatio: quote?.peRatio,
    }
  }, [chartPoints, quote?.peRatio])

  const {
    result: indicatorAnalysis,
    isLoading: isIndicatorLoading,
    error: workerError,
  } = useWorkerCalculation(workerInput)

  const chartOverlays = useMemo(
    () => buildChartOverlays(chartSeries, indicatorAnalysis),
    [chartSeries, indicatorAnalysis],
  )

  const isChartInitialLoading = isHistoryLoading && chartSeries.length === 0
  const isChartRefreshing = isHistoryFetching && chartSeries.length > 0

  /** Toggles one moving-average overlay on the chart. */
  function handleOverlayToggle(key: ChartOverlayKey) {
    setOverlayVisibility((current) => toggleChartOverlayVisibility(current, key))
  }

  /** Opens the alert dialog for a price level selected on the chart. */
  function handleChartPriceClick(payload: ChartPriceClickPayload) {
    setChartAlertDraft(payload)
  }

  /** Creates a price alert from the chart-selected baseline. */
  async function handleCreateChartAlert(input: {
    thresholdPercent: number
    emailEnabled: boolean
    baselinePrice: number
  }) {
    if (!symbol) {
      return
    }

    await createAlert({
      symbol,
      thresholdPercent: input.thresholdPercent,
      emailEnabled: input.emailEnabled,
      baselinePrice: input.baselinePrice,
    })
  }

  if (!symbol) {
    return (
      <EmptyState
        message="Select a stock from your watchlist to view its chart and live quote."
        className="flex min-h-[24rem] flex-1 flex-col items-center justify-center bg-card px-6 py-10"
      />
    )
  }

  return (
    <div data-testid="stock-chart-panel">
    <Panel
      title={symbol}
      description="Live chart with quote polling and simulated tick updates"
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
            <dd>
              <SimulatedLivePrice
                price={quote.price}
                lastSyncedAtMs={dataUpdatedAt}
                liveState={livePriceState}
                streamLabel="Live price updates"
              />
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

      <ChartIndicatorStrip
        analysis={indicatorAnalysis}
        livePrice={quote?.price ?? null}
        isLoading={isIndicatorLoading}
        overlayVisibility={overlayVisibility}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
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
            <SelectTrigger
              className={cn('w-[7rem]', isChartRefreshing && 'opacity-70')}
              aria-label="Chart range"
              aria-busy={isChartRefreshing}
            >
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

        <ChartOverlayToggles visibility={overlayVisibility} onToggle={handleOverlayToggle} />
      </div>

      <div className="flex min-h-[16rem] flex-1 flex-col rounded-xl border border-border bg-muted/40 p-2">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2">
          <p className="text-xs text-muted-foreground">
            Click the chart to add a price alert at a specific level.
          </p>
          {quote && dataUpdatedAt ? (
            <LiveStreamIndicator lastSyncedAtMs={dataUpdatedAt} label="Live chart updates" />
          ) : null}
        </div>
        {historyError ? <ErrorMessage message={historyError} /> : null}
        {workerError ? <ErrorMessage message={workerError} /> : null}

        {!historyError && (isChartInitialLoading || chartSeries.length > 0) ? (
          <StockChart
            symbol={symbol}
            series={chartSeries}
            overlays={chartOverlays}
            overlayVisibility={overlayVisibility}
            isDarkMode={isDarkMode}
            isLoading={isChartInitialLoading}
            isRefreshing={isChartRefreshing}
            fitContentKey={`${symbol ?? ''}-${range}`}
            onPriceClick={handleChartPriceClick}
          />
        ) : null}

        {!isChartInitialLoading && !historyError && history?.points.length === 0 ? (
          <EmptyState
            message="No historical data available for this range."
            variant="plain"
            className="flex flex-1 items-center justify-center"
          />
        ) : null}
      </div>

      {symbol && chartAlertDraft && user ? (
        <ChartPriceAlertDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setChartAlertDraft(null)
            }
          }}
          symbol={symbol}
          baselinePrice={chartAlertDraft.price}
          timeLabel={chartAlertDraft.timeLabel}
          userEmail={user.email}
          creating={isCreatingAlert}
          onCreate={handleCreateChartAlert}
        />
      ) : null}
    </Panel>
    </div>
  )
}

export default StockChartPanel
