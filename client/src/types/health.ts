/** Dependency connectivity reported by GET /health. */
export type DependencyHealth = {
  connected: boolean
}

/** Health check response from GET /health. */
export type HealthResponse = {
  status: 'ok' | 'degraded'
  service: string
  database: DependencyHealth
  redis: DependencyHealth
}
