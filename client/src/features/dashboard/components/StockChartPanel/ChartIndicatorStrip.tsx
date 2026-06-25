import {
  CHART_OVERLAY_KEYS,
  CHART_OVERLAY_LABELS,
  getLatestFiniteValue,
} from '@/features/stocks/lib/chartIndicatorSeries'
import type { ChartOverlayVisibility } from '@/features/stocks/lib/chartOverlayVisibility'
import { DEFAULT_CHART_OVERLAY_VISIBILITY } from '@/features/stocks/lib/chartOverlayVisibility'
import type { MarketDataAnalysis, PeRatioCategory } from '@/features/stocks/lib/marketDataCalculations'
import { cn } from '@/lib/utils'

/** Display labels for fundamental P/E categories. */
const PE_CATEGORY_LABELS: Record<PeRatioCategory, string> = {
  low: 'Undervalued',
  fair: 'Fair value',
  high: 'Expensive',
  unknown: 'Unknown',
}

/** Tailwind classes for fundamental P/E category chips. */
const PE_CATEGORY_CLASSES: Record<PeRatioCategory, string> = {
  low: 'bg-positive-muted text-positive',
  fair: 'bg-warning-muted text-warning',
  high: 'bg-negative-muted text-negative',
  unknown: 'bg-muted text-muted-foreground',
}

type ChartIndicatorStripProps = {
  analysis: MarketDataAnalysis | null
  livePrice: number | null
  isLoading?: boolean
  overlayVisibility?: ChartOverlayVisibility
}

/** Compact summary of worker-computed technical and fundamental indicators. */
function ChartIndicatorStrip({
  analysis,
  livePrice,
  isLoading = false,
  overlayVisibility = DEFAULT_CHART_OVERLAY_VISIBILITY,
}: ChartIndicatorStripProps) {
  const sma20 = analysis ? getLatestFiniteValue(analysis.sma20) : null
  const sma50 = analysis ? getLatestFiniteValue(analysis.sma50) : null
  const ema12 = analysis ? getLatestFiniteValue(analysis.ema12) : null
  const peCategory = analysis?.fundamentalContext.category ?? 'unknown'

  if (!analysis && !isLoading) {
    return null
  }

  return (
    <div
      className="rounded-lg border border-border bg-card/60 px-3 py-2"
      aria-busy={isLoading}
      aria-label="Technical indicators"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
        {overlayVisibility[CHART_OVERLAY_KEYS.SMA20] ? (
          <IndicatorItem
            label={CHART_OVERLAY_LABELS[CHART_OVERLAY_KEYS.SMA20]}
            value={formatIndicatorPrice(sma20)}
            isLoading={isLoading}
            colorVar="--chart-sma20"
          />
        ) : null}
        {overlayVisibility[CHART_OVERLAY_KEYS.SMA50] ? (
          <IndicatorItem
            label={CHART_OVERLAY_LABELS[CHART_OVERLAY_KEYS.SMA50]}
            value={formatIndicatorPrice(sma50)}
            isLoading={isLoading}
            colorVar="--chart-sma50"
          />
        ) : null}
        {overlayVisibility[CHART_OVERLAY_KEYS.EMA12] ? (
          <IndicatorItem
            label={CHART_OVERLAY_LABELS[CHART_OVERLAY_KEYS.EMA12]}
            value={formatIndicatorPrice(ema12)}
            isLoading={isLoading}
            colorVar="--chart-ema12"
          />
        ) : null}
        {overlayVisibility[CHART_OVERLAY_KEYS.SMA20] ? (
          <IndicatorItem
            label="Price vs SMA 20"
            value={formatPriceVsSma(livePrice, sma20)}
            isLoading={isLoading}
          />
        ) : null}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Valuation</span>
          {isLoading ? (
            <span className="inline-block h-5 w-20 animate-pulse rounded bg-muted" />
          ) : (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                PE_CATEGORY_CLASSES[peCategory],
              )}
            >
              {PE_CATEGORY_LABELS[peCategory]}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/** Formats a currency value for the indicator strip. */
function formatIndicatorPrice(value: number | null): string {
  if (value === null) {
    return '—'
  }

  return `$${value.toFixed(2)}`
}

/** Describes price position relative to the SMA 20. */
function formatPriceVsSma(livePrice: number | null, sma20: number | null): string {
  if (livePrice === null || sma20 === null) {
    return '—'
  }

  if (livePrice > sma20) {
    return 'Above SMA 20'
  }

  if (livePrice < sma20) {
    return 'Below SMA 20'
  }

  return 'At SMA 20'
}

type IndicatorItemProps = {
  label: string
  value: string
  isLoading: boolean
  colorVar?: string
}

/** Renders one labeled indicator value in the strip. */
function IndicatorItem({ label, value, isLoading, colorVar }: IndicatorItemProps) {
  return (
    <div className="flex items-center gap-2">
      {colorVar ? (
        <span
          className="inline-block h-0.5 w-4 rounded-full"
          style={{ backgroundColor: `var(${colorVar})` }}
          aria-hidden="true"
        />
      ) : null}
      <span className="text-muted-foreground">{label}</span>
      {isLoading ? (
        <span className="inline-block h-4 w-14 animate-pulse rounded bg-muted" />
      ) : (
        <span className="font-medium text-foreground">{value}</span>
      )}
    </div>
  )
}

export default ChartIndicatorStrip
