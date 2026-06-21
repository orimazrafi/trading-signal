import type { HealthResponse } from '../../types/health'

export type StatusCardProps = {
  health: HealthResponse | undefined
  error: string | null
  loading: boolean
}
