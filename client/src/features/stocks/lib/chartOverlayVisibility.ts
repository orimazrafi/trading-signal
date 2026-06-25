import type { Time } from 'lightweight-charts'
import {
  CHART_OVERLAY_KEYS,
  CHART_OVERLAY_LABELS,
  type ChartOverlayKey,
  type ChartLineOverlay,
} from '@/features/stocks/lib/chartIndicatorSeries'

/** Default visibility for each moving-average overlay on the chart. */
export const DEFAULT_CHART_OVERLAY_VISIBILITY: Record<ChartOverlayKey, boolean> = {
  [CHART_OVERLAY_KEYS.SMA20]: true,
  [CHART_OVERLAY_KEYS.SMA50]: true,
  [CHART_OVERLAY_KEYS.EMA12]: true,
}

/** User-controlled visibility map for chart indicator overlays. */
export type ChartOverlayVisibility = Record<ChartOverlayKey, boolean>

/** Returns a copy of overlay visibility with one key toggled. */
export function toggleChartOverlayVisibility(
  current: ChartOverlayVisibility,
  key: ChartOverlayKey,
): ChartOverlayVisibility {
  return {
    ...current,
    [key]: !current[key],
  }
}

/** CSS variable for each overlay line color (matches chart theme tokens). */
export const CHART_OVERLAY_COLOR_VARS: Record<ChartOverlayKey, string> = {
  [CHART_OVERLAY_KEYS.SMA20]: '--chart-sma20',
  [CHART_OVERLAY_KEYS.SMA50]: '--chart-sma50',
  [CHART_OVERLAY_KEYS.EMA12]: '--chart-ema12',
}

/** One indicator value shown inside the chart crosshair tooltip. */
export type ChartTooltipOverlayValue = {
  key: ChartOverlayKey
  label: string
  value: number
  colorVar: string
}

/** Payload rendered by the stock chart hover tooltip. */
export type ChartTooltipPayload = {
  timeLabel: string
  price: number
  overlays: ChartTooltipOverlayValue[]
}

/** Pads a numeric month or day for ISO-style dates. */
function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}

/** Formats a lightweight-charts time value for tooltip display. */
export function formatChartTooltipTime(time: Time): string {
  if (typeof time === 'string') {
    return time
  }

  if (typeof time === 'number') {
    return new Date(time * 1000).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if ('year' in time) {
    return `${time.year}-${padDatePart(time.month)}-${padDatePart(time.day)}`
  }

  return ''
}

/** Formats a price for tooltip display. */
export function formatChartTooltipPrice(value: number): string {
  return `$${value.toFixed(2)}`
}

/** Builds tooltip overlay rows for visible series at the crosshair. */
export function buildChartTooltipOverlays(input: {
  overlays: readonly ChartLineOverlay[]
  visibility: ChartOverlayVisibility
  overlayValues: Partial<Record<ChartOverlayKey, number>>
}): ChartTooltipOverlayValue[] {
  const rows: ChartTooltipOverlayValue[] = []

  for (const overlay of input.overlays) {
    if (!input.visibility[overlay.key]) {
      continue
    }

    const value = input.overlayValues[overlay.key]

    if (value === undefined || !Number.isFinite(value)) {
      continue
    }

    rows.push({
      key: overlay.key,
      label: CHART_OVERLAY_LABELS[overlay.key],
      value,
      colorVar: CHART_OVERLAY_COLOR_VARS[overlay.key],
    })
  }

  return rows
}
