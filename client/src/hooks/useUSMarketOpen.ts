import { useEffect, useState } from 'react'
import { isUSMarketOpen, US_MARKET_STATUS_REFRESH_MS } from '@/lib/usMarketHours'

/** Tracks whether US equities are in regular trading hours, refreshing every minute. */
export function useUSMarketOpen(): boolean {
  const [isOpen, setIsOpen] = useState(() => isUSMarketOpen())

  useEffect(() => {
    const syncMarketStatus = () => {
      setIsOpen(isUSMarketOpen())
    }

    syncMarketStatus()

    const intervalId = window.setInterval(syncMarketStatus, US_MARKET_STATUS_REFRESH_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  return isOpen
}
