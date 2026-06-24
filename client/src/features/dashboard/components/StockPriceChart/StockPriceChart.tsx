import { useEffect, useRef } from 'react'
import { AreaSeries, ColorType, createChart, type IChartApi, type ISeriesApi } from 'lightweight-charts'
import { resolveChartThemeColors } from '@/lib/chartTheme'
import type { StockPriceChartProps } from './types'
import { toAreaSeriesData } from './stockChartUtils'

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
