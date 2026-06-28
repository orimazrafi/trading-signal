import axios from 'axios'
import type { HealthResponse } from '@/types/health'

const HEALTH_TIMEOUT_MS = 5_000

/** Fetches orchestration health from GET /health (outside the versioned API prefix). */
export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const { data } = await axios.get<HealthResponse>('/health', {
    signal,
    timeout: HEALTH_TIMEOUT_MS,
  })

  return data
}
