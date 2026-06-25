import type { StockHistoryPoint } from '@/types/stock'
import type { MarketDataAnalysis } from '@/features/stocks/lib/marketDataCalculations'

/** Worker request payload for one market-data calculation run. */
export type WorkerCalculateRequest = {
  requestId: string
  points: StockHistoryPoint[]
  peRatio?: number
}

/** Successful worker response with computed indicators. */
export type WorkerCalculateSuccess = {
  requestId: string
  ok: true
  result: MarketDataAnalysis
}

/** Failed worker response with a human-readable error message. */
export type WorkerCalculateFailure = {
  requestId: string
  ok: false
  error: string
}

/** Union of all worker responses posted back to the main thread. */
export type WorkerCalculateResponse = WorkerCalculateSuccess | WorkerCalculateFailure

/** Input accepted by useWorkerCalculation on the main thread. */
export type WorkerCalculationInput = {
  points: StockHistoryPoint[]
  peRatio?: number
}
