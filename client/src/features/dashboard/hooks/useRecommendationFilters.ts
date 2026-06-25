import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  buildRecommendationSearchParams,
  parseRecommendationUrlFilters,
  type RecommendationSortKey,
  type RecommendationUrlFilters,
} from '@/features/dashboard/lib/recommendationFilters'
import type { RecommendationAction, RecommendationSource } from '@/types/recommendation'

/** Syncs market ideas filters with the URL search string. */
export function useRecommendationFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => parseRecommendationUrlFilters(searchParams), [searchParams])

  /** Merges partial filter updates into the URL. */
  const setFilters = useCallback(
    (next: Partial<RecommendationUrlFilters>) => {
      const merged: RecommendationUrlFilters = { ...filters, ...next }
      setSearchParams(buildRecommendationSearchParams(merged), { replace: true })
    },
    [filters, setSearchParams],
  )

  /** Clears all recommendation filters from the URL. */
  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  /** Updates the sector filter in the URL. */
  const setSector = useCallback(
    (sector: string | null) => setFilters({ sector }),
    [setFilters],
  )

  /** Updates the source filter in the URL. */
  const setSource = useCallback(
    (source: RecommendationSource | null) => setFilters({ source }),
    [setFilters],
  )

  /** Updates the action filter in the URL. */
  const setAction = useCallback(
    (action: RecommendationAction | null) => setFilters({ action }),
    [setFilters],
  )

  /** Updates the sort key in the URL. */
  const setSort = useCallback(
    (sort: RecommendationSortKey) => setFilters({ sort }),
    [setFilters],
  )

  const hasActiveFilters =
    filters.sector !== null || filters.source !== null || filters.action !== null

  return {
    filters,
    hasActiveFilters,
    setFilters,
    clearFilters,
    setSector,
    setSource,
    setAction,
    setSort,
  }
}
