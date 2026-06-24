import { useEffect, useRef } from 'react'
import { AreaSeries, ColorType, createChart, type IChartApi, type ISeriesApi } from 'lightweight-charts'
import type { StockHistoryPoint } from '@/types/stockHistory'

export type StockPriceChartProps = {
  points: StockHistoryPoint[]
  isDarkMode?: boolean
}

/** Maps OHLCV points to area-series values for Lightweight Charts. */
function toAreaSeriesData(points: StockHistoryPoint[]) {
  return points.map((point) => ({
    time: point.time,
    value: point.close,
  }))
}

/** Builds chart colors for the current theme. */
function buildChartColors(isDarkMode: boolean) {
  if (isDarkMode) {
    return {
      background: '#0f172a',
      text: '#94a3b8',
      grid: '#1e293b',
      line: '#38bdf8',
      top: 'rgba(56, 189, 248, 0.35)',
      bottom: 'rgba(56, 189, 248, 0.02)',
    }
  }

  return {
    background: '#ffffff',
    text: '#64748b',
    grid: '#e2e8f0',
    line: '#2563eb',
    top: 'rgba(37, 99, 235, 0.35)',
    bottom: 'rgba(37, 99, 235, 0.02)',
  }
}

/** Renders a responsive area chart for daily close prices. */
function StockPriceChart({ points, isDarkMode = false }: StockPriceChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const colors = buildChartColors(isDarkMode)
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
      },
      crosshair: {
        vertLine: { labelVisible: false },
      },
      width: container.clientWidth,
      height: container.clientHeight,
    })

    const series = chart.addSeries(AreaSeries, {
      lineColor: colors.line,
      topColor: colors.top,
      bottomColor: colors.bottom,
      lineWidth: 2,
    })

    chartRef.current = chart
    seriesRef.current = series

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }

      chart.applyOptions({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [isDarkMode])

  useEffect(() => {
    if (!seriesRef.current || points.length === 0) {
      return
    }

    seriesRef.current.setData(toAreaSeriesData(points))
    chartRef.current?.timeScale().fitContent()
  }, [points])

  return <div ref={containerRef} className="h-full min-h-[16rem] w-full" />
}

export default StockPriceChart
