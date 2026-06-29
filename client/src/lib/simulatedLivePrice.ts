/** Client-side micro-fluctuation bounds for simulated live price ticks. */

/** How often the simulated live price updates on screen. */
export const SIMULATED_LIVE_TICK_MS = 3_000

/** Minimum random move per tick (0.01%). */
export const SIMULATED_LIVE_MIN_FLUCTUATION_PERCENT = 0.0001

/** Maximum random move per tick (0.05%). */
export const SIMULATED_LIVE_MAX_FLUCTUATION_PERCENT = 0.0005

/** Shown beside simulated or delayed prices so users know the value is not exchange-realtime. */
export const DISPLAY_PRICE_DISCLAIMER = 'May differ from actual market price'

export type SimulatedPriceFlashDirection = 'up' | 'down' | null

/** Applies a safe random micro-percentage move to a validated base price. */
export function applySimulatedMicroFluctuation(basePrice: number): {
  nextPrice: number
  direction: Exclude<SimulatedPriceFlashDirection, null>
} {
  const magnitude =
    SIMULATED_LIVE_MIN_FLUCTUATION_PERCENT +
    Math.random() * (SIMULATED_LIVE_MAX_FLUCTUATION_PERCENT - SIMULATED_LIVE_MIN_FLUCTUATION_PERCENT)
  const direction: Exclude<SimulatedPriceFlashDirection, null> = Math.random() >= 0.5 ? 'up' : 'down'
  const signedDelta = direction === 'up' ? magnitude : -magnitude
  const nextPrice = Math.max(0.01, basePrice * (1 + signedDelta))

  return { nextPrice, direction }
}

/** Formats minutes elapsed since the last provider sync for the transparency label. */
export function formatMinutesSinceSync(lastSyncedAtMs: number, nowMs = Date.now()): number {
  if (!Number.isFinite(lastSyncedAtMs) || lastSyncedAtMs <= 0) {
    return 0
  }

  return Math.max(0, Math.floor((nowMs - lastSyncedAtMs) / 60_000))
}

/** Builds a short label for when the displayed price was last synced from the API. */
export function formatPriceSyncLabel(lastSyncedAtMs: number, nowMs = Date.now()): string {
  const minutes = formatMinutesSinceSync(lastSyncedAtMs, nowMs)
  const unit = minutes === 1 ? 'min' : 'mins'
  return `Synced ${minutes} ${unit} ago`
}
