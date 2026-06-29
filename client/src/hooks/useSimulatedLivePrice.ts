import { useEffect, useState } from 'react'
import { isSimulatedLiveEnabled } from '@/lib/isSimulatedLiveEnabled'
import { isPageActive, subscribePageActivity } from '@/lib/pageActivity'
import {
  applySimulatedMicroFluctuation,
  formatMinutesSinceSync,
  SIMULATED_LIVE_TICK_MS,
  type SimulatedPriceFlashDirection,
} from '@/lib/simulatedLivePrice'

/** Simulates subtle live price movement between infrequent API refreshes. */
export function useSimulatedLivePrice(basePrice: number | null, lastSyncedAtMs: number | null) {
  const [displayPrice, setDisplayPrice] = useState<number | null>(basePrice)
  const [flashDirection, setFlashDirection] = useState<SimulatedPriceFlashDirection>(null)
  const [minutesSinceSync, setMinutesSinceSync] = useState(() =>
    lastSyncedAtMs ? formatMinutesSinceSync(lastSyncedAtMs) : 0,
  )

  useEffect(() => {
    setDisplayPrice(basePrice)
    setFlashDirection(null)
  }, [basePrice, lastSyncedAtMs])

  useEffect(() => {
    if (basePrice === null || !Number.isFinite(basePrice)) {
      return
    }

    if (!isSimulatedLiveEnabled()) {
      return
    }

    let tickTimer: ReturnType<typeof setInterval> | undefined
    let flashTimer: ReturnType<typeof setTimeout> | undefined
    let syncLabelTimer: ReturnType<typeof setInterval> | undefined

    /** Starts micro-fluctuation ticks while the page is active. */
    const startTicks = () => {
      if (tickTimer) {
        return
      }

      tickTimer = setInterval(() => {
        const { nextPrice, direction } = applySimulatedMicroFluctuation(basePrice)
        setDisplayPrice(nextPrice)
        setFlashDirection(direction)

        if (flashTimer) {
          clearTimeout(flashTimer)
        }

        flashTimer = setTimeout(() => {
          setFlashDirection(null)
        }, 600)
      }, SIMULATED_LIVE_TICK_MS)
    }

    /** Stops ticks when the tab is hidden or the window loses focus. */
    const stopTicks = () => {
      if (tickTimer) {
        clearInterval(tickTimer)
        tickTimer = undefined
      }
    }

    const handleActivityChange = (isActive: boolean) => {
      if (isActive) {
        startTicks()
        return
      }

      stopTicks()
      setDisplayPrice(basePrice)
      setFlashDirection(null)
    }

    const unsubscribe = subscribePageActivity(handleActivityChange)

    if (isPageActive()) {
      startTicks()
    }

    if (lastSyncedAtMs) {
      setMinutesSinceSync(formatMinutesSinceSync(lastSyncedAtMs))
      syncLabelTimer = setInterval(() => {
        setMinutesSinceSync(formatMinutesSinceSync(lastSyncedAtMs))
      }, 30_000)
    }

    return () => {
      unsubscribe()
      stopTicks()

      if (flashTimer) {
        clearTimeout(flashTimer)
      }

      if (syncLabelTimer) {
        clearInterval(syncLabelTimer)
      }
    }
  }, [basePrice, lastSyncedAtMs])

  return {
    displayPrice,
    flashDirection,
    minutesSinceSync,
  }
}
