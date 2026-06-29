import { describe, expect, it } from 'vitest'
import { isUSMarketOpen } from './usMarketHours'

/** Tuesday 2026-06-23 15:00 ET (EDT, UTC-4). */
const TUESDAY_MARKET_OPEN_ET = new Date('2026-06-23T19:00:00.000Z')

/** Tuesday 2026-06-23 09:29 ET — one minute before the open. */
const TUESDAY_BEFORE_OPEN_ET = new Date('2026-06-23T13:29:00.000Z')

/** Saturday 2026-06-27 midday ET. */
const SATURDAY_MIDDAY_ET = new Date('2026-06-27T16:00:00.000Z')

describe('isUSMarketOpen', () => {
  it('returns true during regular hours on a weekday', () => {
    expect(isUSMarketOpen(TUESDAY_MARKET_OPEN_ET)).toBe(true)
  })

  it('returns false before the 9:30 AM ET open', () => {
    expect(isUSMarketOpen(TUESDAY_BEFORE_OPEN_ET)).toBe(false)
  })

  it('returns false on weekends', () => {
    expect(isUSMarketOpen(SATURDAY_MIDDAY_ET)).toBe(false)
  })
})
