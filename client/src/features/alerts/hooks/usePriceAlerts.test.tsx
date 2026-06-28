import { API_BASE_PATH } from '@trading-signal/contracts/apiPath'
import { HTTP_STATUS } from '@trading-signal/contracts/httpStatus'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { createQueryClientWrapper } from '@/test/testUtils'
import { priceAlertsListBody } from '@/test/msw/fixtures'
import { mswServer } from '@/test/msw/server'
import type { PriceAlert } from '@/types/alert'
import { usePriceAlerts } from './usePriceAlerts'

const sampleAlert: PriceAlert = {
  id: 'alert-1',
  symbol: 'AAPL',
  thresholdPercent: 2,
  baselinePrice: 190,
  enabled: true,
  emailEnabled: true,
  lastTriggeredAt: null,
  createdAt: '2026-06-24T12:00:00.000Z',
  updatedAt: '2026-06-24T12:00:00.000Z',
}

describe('usePriceAlerts', () => {
  it('exposes loaded alerts when the query succeeds', async () => {
    mswServer.use(
      http.get(`${API_BASE_PATH}/price-alerts`, () =>
        HttpResponse.json(priceAlertsListBody([sampleAlert])),
      ),
    )

    const { QueryClientWrapper } = createQueryClientWrapper()

    const { result } = renderHook(() => usePriceAlerts(), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.alerts).toEqual([sampleAlert])
    expect(result.current.error).toBeNull()
  })

  it('includes a newly created alert after createAlertFromFields completes', async () => {
    const msftAlert: PriceAlert = {
      ...sampleAlert,
      id: 'alert-2',
      symbol: 'MSFT',
      thresholdPercent: 3,
      emailEnabled: false,
    }

    let alerts = [sampleAlert]

    mswServer.use(
      http.get(`${API_BASE_PATH}/price-alerts`, () =>
        HttpResponse.json(priceAlertsListBody(alerts)),
      ),
      http.post(`${API_BASE_PATH}/price-alerts`, async () => {
        alerts = [...alerts, msftAlert]
        return HttpResponse.json({ alert: msftAlert }, { status: HTTP_STATUS.CREATED })
      }),
    )

    const { QueryClientWrapper } = createQueryClientWrapper()

    const { result } = renderHook(() => usePriceAlerts(), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.createAlertFromFields('MSFT', 3, false)

    await waitFor(() => {
      expect(result.current.alerts).toEqual([sampleAlert, msftAlert])
    })

    expect(result.current.creating).toBe(false)
    expect(result.current.error).toBeNull()
  })
})
