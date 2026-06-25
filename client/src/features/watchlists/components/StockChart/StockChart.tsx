import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  AreaSeries,
  ColorType,
  createChart,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
} from 'lightweight-charts'
import {
  CHART_OVERLAY_KEYS,
  type ChartOverlayKey,
} from '@/features/stocks/lib/chartIndicatorSeries'
import {
  buildChartTooltipOverlays,
  DEFAULT_CHART_OVERLAY_VISIBILITY,
  formatChartTooltipTime,
  type ChartOverlayVisibility,
  type ChartTooltipPayload,
} from '@/features/stocks/lib/chartOverlayVisibility'
import { resolveChartThemeColors } from '@/lib/chartTheme'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { applyStockChartTheme } from './applyStockChartTheme'
import StockChartTooltip from './StockChartTooltip'
import { stockChartPropsAreEqual } from './stockChartPropsAreEqual'
import type { StockChartProps } from './types'

/** Applies the latest series snapshot to the active area series. */
function applySeriesData(
  chart: IChartApi,
  areaSeries: ISeriesApi<'Area'>,
  series: StockChartProps['series'],
  shouldFitContent: boolean,
): void {
  if (series.length === 0) {
    return
  }

  areaSeries.setData([...series])

  if (shouldFitContent) {
    chart.timeScale().fitContent()
  }
}

type ChartTooltipState = {
  payload: ChartTooltipPayload
  position: { x: number; y: number }
}

/** Applies indicator overlay data and visibility to line series. */
function applyOverlayData(
  overlaySeries: Partial<Record<ChartOverlayKey, ISeriesApi<'Line'>>>,
  overlays: StockChartProps['overlays'],
  visibility: ChartOverlayVisibility,
): void {
  for (const overlayKey of Object.values(CHART_OVERLAY_KEYS)) {
    const lineSeries = overlaySeries[overlayKey]

    if (!lineSeries) {
      continue
    }

    const overlay = overlays?.find((entry) => entry.key === overlayKey)
    const isVisible = visibility[overlayKey] && overlay && overlay.data.length > 0

    if (!isVisible || !overlay) {
      lineSeries.setData([])
      lineSeries.applyOptions({ visible: false })
      continue
    }

    lineSeries.setData([...overlay.data])
    lineSeries.applyOptions({ visible: true })
  }
}

/** Reads a numeric value from a lightweight-charts crosshair data point. */
function readCrosshairValue(data: unknown): number | undefined {
  if (typeof data !== 'object' || data === null || !('value' in data)) {
    return undefined
  }

  const { value } = data

  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

/** Renders an isolated Lightweight Charts canvas with minimal parent-driven re-renders. */
function StockChartComponent({
  symbol,
  series,
  overlays = [],
  overlayVisibility = DEFAULT_CHART_OVERLAY_VISIBILITY,
  isDarkMode = false,
  isLoading = false,
  isRefreshing = false,
  fitContentKey = '',
  onPriceClick,
}: StockChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const overlaySeriesRef = useRef<Partial<Record<ChartOverlayKey, ISeriesApi<'Line'>>>>({})
  const lastFitContentKeyRef = useRef('')
  const overlaysRef = useRef(overlays)
  const visibilityRef = useRef(overlayVisibility)
  const onPriceClickRef = useRef(onPriceClick)
  const [tooltip, setTooltip] = useState<ChartTooltipState | null>(null)
  const showSkeleton = isLoading && series.length === 0

  overlaysRef.current = overlays
  visibilityRef.current = overlayVisibility
  onPriceClickRef.current = onPriceClick

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const colors = resolveChartThemeColors()
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        rightOffset: 12,
        lockVisibleTimeRangeOnResize: true,
      },
      crosshair: {
        vertLine: { labelVisible: true },
        horzLine: { labelVisible: true },
      },
      width: container.clientWidth,
      height: Math.max(container.clientHeight, 256),
    })

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: colors.line,
      topColor: colors.top,
      bottomColor: colors.bottom,
      lineWidth: 2,
      crosshairMarkerVisible: true,
    })

    const overlaySeries: Partial<Record<ChartOverlayKey, ISeriesApi<'Line'>>> = {}

    for (const overlayKey of Object.values(CHART_OVERLAY_KEYS)) {
      overlaySeries[overlayKey] = chart.addSeries(LineSeries, {
        color: colors.ema12,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: true,
      })
    }

    applyStockChartTheme(chart, areaSeries, overlaySeries, colors)

    chartRef.current = chart
    seriesRef.current = areaSeries
    overlaySeriesRef.current = overlaySeries
    lastFitContentKeyRef.current = ''
    applySeriesData(chart, areaSeries, series, true)
    applyOverlayData(overlaySeries, overlays, overlayVisibility)

    const handleCrosshairMove = (param: MouseEventParams) => {
      if (
        param.point === undefined ||
        param.time === undefined ||
        param.seriesData.size === 0
      ) {
        setTooltip(null)
        return
      }

      const priceValue = readCrosshairValue(param.seriesData.get(areaSeries))

      if (priceValue === undefined) {
        setTooltip(null)
        return
      }

      const overlayValues: Partial<Record<ChartOverlayKey, number>> = {}

      for (const [key, lineSeries] of Object.entries(overlaySeries)) {
        if (!lineSeries) {
          continue
        }

        const overlayKey = key as ChartOverlayKey
        const overlayValue = readCrosshairValue(param.seriesData.get(lineSeries))

        if (overlayValue !== undefined) {
          overlayValues[overlayKey] = overlayValue
        }
      }

      setTooltip({
        payload: {
          timeLabel: formatChartTooltipTime(param.time),
          price: priceValue,
          overlays: buildChartTooltipOverlays({
            overlays: overlaysRef.current,
            visibility: visibilityRef.current,
            overlayValues,
          }),
        },
        position: { x: param.point.x, y: param.point.y },
      })
    }

    chart.subscribeCrosshairMove(handleCrosshairMove)

    const handleClick = (param: MouseEventParams) => {
      const clickHandler = onPriceClickRef.current

      if (!clickHandler || param.point === undefined) {
        return
      }

      const priceValue = areaSeries.coordinateToPrice(param.point.y)

      if (priceValue === null || !Number.isFinite(priceValue) || priceValue <= 0) {
        return
      }

      clickHandler({
        price: priceValue,
        timeLabel: param.time === undefined ? undefined : formatChartTooltipTime(param.time),
      })
    }

    chart.subscribeClick(handleClick)

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (!entry) {
        return
      }

      chart.applyOptions({
        width: entry.contentRect.width,
        height: Math.max(entry.contentRect.height, 256),
      })
    })

    resizeObserver.observe(container)

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove)
      chart.unsubscribeClick(handleClick)
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      overlaySeriesRef.current = {}
      lastFitContentKeyRef.current = ''
      setTooltip(null)
    }
  }, [symbol])

  useEffect(() => {
    const chart = chartRef.current
    const areaSeries = seriesRef.current

    if (!chart || !areaSeries) {
      return
    }

    applyStockChartTheme(chart, areaSeries, overlaySeriesRef.current, resolveChartThemeColors())
  }, [isDarkMode])

  useLayoutEffect(() => {
    const chart = chartRef.current
    const areaSeries = seriesRef.current

    if (!chart || !areaSeries || series.length === 0) {
      return
    }

    const shouldFitContent = fitContentKey !== lastFitContentKeyRef.current

    if (shouldFitContent) {
      lastFitContentKeyRef.current = fitContentKey
    }

    applySeriesData(chart, areaSeries, series, shouldFitContent)
    applyOverlayData(overlaySeriesRef.current, overlays, overlayVisibility)
  }, [series, overlays, overlayVisibility, symbol, fitContentKey])

  return (
    <div className="relative flex min-h-[16rem] flex-1 flex-col" data-symbol={symbol}>
      {showSkeleton ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <LoadingSpinner label="Loading chart…" />
        </div>
      ) : null}
      <StockChartTooltip payload={tooltip?.payload ?? null} position={tooltip?.position ?? null} />
      <div
        ref={containerRef}
        className={cn(
          'min-h-[16rem] flex-1 w-full transition-opacity duration-200',
          onPriceClick ? 'cursor-crosshair' : undefined,
          isRefreshing ? 'opacity-60' : 'opacity-100',
        )}
        aria-label={`${symbol} price chart`}
      />
    </div>
  )
}

const StockChart = memo(StockChartComponent, stockChartPropsAreEqual)

export default StockChart
