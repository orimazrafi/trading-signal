import { describe, expect, it } from 'vitest'
import { mergeLivePriceIntoHistory, sortHistoryPointsByTime } from './chartSeries'

const samplePoints = [
  { time: '2026-06-22', open: 24, high: 26, low: 23.5, close: 25, volume: 1000 },
  { time: '2026-06-23', open: 25, high: 26.5, low: 24.8, close: 25.98, volume: 1100 },
] as const

describe('mergeLivePriceIntoHistory', () => {
  it('updates today bar close for multi-day ranges', () => {
    const today = new Date().toISOString().slice(0, 10)
    const points = sortHistoryPointsByTime([
      ...samplePoints,
      { time: today, open: 25.5, high: 26, low: 25.2, close: 25.5, volume: 900 },
    ])

    const merged = mergeLivePriceIntoHistory(points, 25.85, '1M')
    const lastBar = merged[merged.length - 1]

    expect(lastBar?.time).toBe(today)
    expect(lastBar?.close).toBe(25.85)
    expect(lastBar?.high).toBeGreaterThanOrEqual(25.85)
    expect(lastBar?.low).toBeLessThanOrEqual(25.85)
  })

  it('returns original points when live price is invalid', () => {
    expect(mergeLivePriceIntoHistory([...samplePoints], 0, '1M')).toEqual([...samplePoints])
  })
})

describe('sortHistoryPointsByTime', () => {
  it('sorts points chronologically', () => {
    const unsorted = [
      { time: '2026-06-23', open: 1, high: 1, low: 1, close: 1, volume: 1 },
      { time: '2026-06-22', open: 1, high: 1, low: 1, close: 1, volume: 1 },
    ]

    expect(sortHistoryPointsByTime(unsorted).map((point) => point.time)).toEqual([
      '2026-06-22',
      '2026-06-23',
    ])
  })
})
