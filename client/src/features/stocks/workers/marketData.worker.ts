import { buildMarketDataAnalysis } from '@/features/stocks/lib/marketDataCalculations'
import type { WorkerCalculateRequest, WorkerCalculateResponse } from './types'

/** Handles heavy SMA/EMA and fundamental calculations off the main UI thread. */
self.onmessage = (event: MessageEvent<WorkerCalculateRequest>) => {
  const { requestId, points, peRatio } = event.data

  try {
    const closes = points.map((point) => point.close)
    const result = buildMarketDataAnalysis({ closes, peRatio })

    const response: WorkerCalculateResponse = {
      requestId,
      ok: true,
      result,
    }

    self.postMessage(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Worker calculation failed'

    const response: WorkerCalculateResponse = {
      requestId,
      ok: false,
      error: message,
    }

    self.postMessage(response)
  }
}

export {}
