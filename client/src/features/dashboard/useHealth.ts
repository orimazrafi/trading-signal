import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import { queryKeys } from '../../api/queryKeys'
import type { HealthResponse } from '../../types/health'

/** Loads API health status when the user is authenticated. */
export function useHealth(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: async () => {
      const { data } = await api.get<HealthResponse>('/health')
      return data
    },
    enabled,
  })
}
