import { describe, expect, it } from 'vitest'
import {
  applySimulatedMicroFluctuation,
  formatMinutesSinceSync,
  SIMULATED_LIVE_MAX_FLUCTUATION_PERCENT,
  SIMULATED_LIVE_MIN_FLUCTUATION_PERCENT,
} from './simulatedLivePrice'

describe('applySimulatedMicroFluctuation', () => {
  it('keeps price positive and within micro-fluctuation bounds', () => {
    const basePrice = 100
    const { nextPrice, direction } = applySimulatedMicroFluctuation(basePrice)
    const deltaPercent = Math.abs(nextPrice - basePrice) / basePrice

    expect(nextPrice).toBeGreaterThan(0)
    expect(deltaPercent).toBeGreaterThanOrEqual(SIMULATED_LIVE_MIN_FLUCTUATION_PERCENT)
    expect(deltaPercent).toBeLessThanOrEqual(SIMULATED_LIVE_MAX_FLUCTUATION_PERCENT)
    expect(direction === 'up' || direction === 'down').toBe(true)
  })
})

describe('formatMinutesSinceSync', () => {
  it('returns whole minutes since the last sync timestamp', () => {
    const nowMs = Date.UTC(2026, 5, 24, 12, 0, 0)
    const lastSyncedAtMs = nowMs - 125_000

    expect(formatMinutesSinceSync(lastSyncedAtMs, nowMs)).toBe(2)
  })

  it('returns zero for invalid timestamps', () => {
    expect(formatMinutesSinceSync(0)).toBe(0)
  })
})
