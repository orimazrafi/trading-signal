import { useEffect, useRef, useState } from 'react'
import type { MarketDataAnalysis } from '@/features/stocks/lib/marketDataCalculations'
import MarketDataWorker from '@/features/stocks/workers/marketData.worker?worker'
import type {
  WorkerCalculateResponse,
  WorkerCalculationInput,
} from '@/features/stocks/workers/types'

type WorkerCalculationState = {
  result: MarketDataAnalysis | null
  isLoading: boolean
  error: string | null
}

const INITIAL_WORKER_STATE: WorkerCalculationState = {
  result: null,
  isLoading: false,
  error: null,
}

let requestCounter = 0

/** Creates a monotonically increasing worker request id. */
function createWorkerRequestId(): string {
  requestCounter += 1
  return `market-data-${requestCounter}`
}

/** Fingerprint for worker input to skip duplicate postMessage calls. */
function workerInputFingerprint(input: WorkerCalculationInput): string {
  const lastPoint = input.points[input.points.length - 1]
  const lastClose = lastPoint?.close ?? 0
  const lastTime = lastPoint?.time ?? ''
  const peRatio = input.peRatio ?? 0

  return `${input.points.length}:${String(lastTime)}:${lastClose}:${peRatio}`
}

/** Offloads SMA/EMA and fundamental calculations to a dedicated Web Worker. */
export function useWorkerCalculation(input: WorkerCalculationInput | null): WorkerCalculationState {
  const workerRef = useRef<Worker | null>(null)
  const fingerprintRef = useRef<string | null>(null)
  const latestRequestIdRef = useRef<string | null>(null)
  const [state, setState] = useState<WorkerCalculationState>(INITIAL_WORKER_STATE)

  useEffect(() => {
    const worker = new MarketDataWorker()
    workerRef.current = worker

    const handleMessage = (event: MessageEvent<WorkerCalculateResponse>) => {
      const payload = event.data

      if (payload.requestId !== latestRequestIdRef.current) {
        return
      }

      if (payload.ok === false) {
        setState({
          result: null,
          isLoading: false,
          error: payload.error,
        })
        return
      }

      setState({
        result: payload.result,
        isLoading: false,
        error: null,
      })
    }

    const handleError = () => {
      setState({
        result: null,
        isLoading: false,
        error: 'Market data worker failed unexpectedly',
      })
    }

    worker.addEventListener('message', handleMessage)
    worker.addEventListener('error', handleError)

    return () => {
      worker.removeEventListener('message', handleMessage)
      worker.removeEventListener('error', handleError)
      worker.terminate()
      workerRef.current = null
      fingerprintRef.current = null
      latestRequestIdRef.current = null
    }
  }, [])

  useEffect(() => {
    const worker = workerRef.current

    if (!worker || !input || input.points.length === 0) {
      fingerprintRef.current = null
      latestRequestIdRef.current = null
      setState(INITIAL_WORKER_STATE)
      return
    }

    const fingerprint = workerInputFingerprint(input)

    if (fingerprintRef.current === fingerprint) {
      return
    }

    fingerprintRef.current = fingerprint
    const requestId = createWorkerRequestId()
    latestRequestIdRef.current = requestId

    setState({
      result: null,
      isLoading: true,
      error: null,
    })

    worker.postMessage({
      requestId,
      points: input.points,
      peRatio: input.peRatio,
    })
  }, [input])

  return state
}
