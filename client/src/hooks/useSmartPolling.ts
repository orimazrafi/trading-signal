import { useEffect, useRef, useState } from 'react'
import { isPageActive, subscribePageActivity } from '@/lib/pageActivity'

/** Runs queryFn on a fixed interval while the tab is visible and the window is focused. */
export function useSmartPolling(
  queryFn: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
): void {
  const queryFnRef = useRef(queryFn)

  useEffect(() => {
    queryFnRef.current = queryFn
  }, [queryFn])

  useEffect(() => {
    if (!enabled || intervalMs <= 0) {
      return
    }

    let intervalId: ReturnType<typeof setInterval> | undefined

    /** Starts the polling interval without duplicating timers. */
    const startPolling = () => {
      if (intervalId) {
        return
      }

      intervalId = setInterval(() => {
        void queryFnRef.current()
      }, intervalMs)
    }

    /** Clears the polling interval so hidden tabs make zero API calls. */
    const stopPolling = () => {
      if (!intervalId) {
        return
      }

      clearInterval(intervalId)
      intervalId = undefined
    }

    /** Resumes or pauses polling in response to visibility/focus events. */
    const handleActivityChange = (isActive: boolean) => {
      if (isActive) {
        startPolling()
        return
      }

      stopPolling()
    }

    const unsubscribe = subscribePageActivity(handleActivityChange)

    if (isPageActive()) {
      startPolling()
    }

    return () => {
      unsubscribe()
      stopPolling()
    }
  }, [enabled, intervalMs])
}

/** Returns a React Query refetchInterval value that is false while the page is inactive. */
export function useSmartPollingInterval(intervalMs: number, enabled = true): number | false {
  const [isActive, setIsActive] = useState(() => isPageActive())

  useEffect(() => {
    if (!enabled) {
      return
    }

    return subscribePageActivity(setIsActive)
  }, [enabled])

  if (!enabled || intervalMs <= 0 || !isActive) {
    return false
  }

  return intervalMs
}
