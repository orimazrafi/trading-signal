import { render, waitFor, cleanup } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSmartPolling, useSmartPollingInterval } from './useSmartPolling'

const pageActivityListeners = new Set<(isActive: boolean) => void>()
const isPageActiveMock = vi.fn(() => true)

vi.mock('@/lib/pageActivity', () => ({
  isPageActive: () => isPageActiveMock(),
  subscribePageActivity: (listener: (isActive: boolean) => void) => {
    pageActivityListeners.add(listener)
    return () => pageActivityListeners.delete(listener)
  },
}))

/** Notifies hook subscribers of a synthetic page-activity change. */
function setPageActive(active: boolean): void {
  isPageActiveMock.mockReturnValue(active)
  pageActivityListeners.forEach((listener) => listener(active))
}

function IntervalProbe({ intervalMs, enabled }: { intervalMs: number; enabled?: boolean }) {
  const pollingInterval = useSmartPollingInterval(intervalMs, enabled)

  return <output aria-label="polling interval">{String(pollingInterval)}</output>
}

describe('useSmartPollingInterval', () => {
  beforeEach(() => {
    isPageActiveMock.mockReturnValue(true)
    pageActivityListeners.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('returns the interval while the page is active', () => {
    const { getByLabelText } = render(<IntervalProbe intervalMs={5000} />)
    expect(getByLabelText('polling interval').textContent).toBe('5000')
  })

  it('returns false when the page is inactive or polling is disabled', async () => {
    const { getByLabelText, rerender } = render(<IntervalProbe intervalMs={5000} />)

    setPageActive(false)
    await waitFor(() => {
      expect(getByLabelText('polling interval').textContent).toBe('false')
    })

    setPageActive(true)
    await waitFor(() => {
      expect(getByLabelText('polling interval').textContent).toBe('5000')
    })

    rerender(<IntervalProbe intervalMs={5000} enabled={false} />)
    expect(getByLabelText('polling interval').textContent).toBe('false')
  })
})

describe('useSmartPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    isPageActiveMock.mockReturnValue(true)
    pageActivityListeners.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('polls while active and stops when the page becomes inactive', async () => {
    const { getByLabelText } = render(<PollingProbe intervalMs={1000} />)

    await vi.advanceTimersByTimeAsync(2500)
    expect(getByLabelText('poll count').textContent).toBe('2')

    setPageActive(false)
    await vi.advanceTimersByTimeAsync(3000)
    expect(getByLabelText('poll count').textContent).toBe('2')
  })
})

/** Mounts useSmartPolling and surfaces poll count as observable output. */
function PollingProbe({ intervalMs }: { intervalMs: number }) {
  const [pollCount, setPollCount] = useState(0)

  useSmartPolling(() => {
    setPollCount((count) => count + 1)
  }, intervalMs)

  return <output aria-label="poll count">{pollCount}</output>
}
