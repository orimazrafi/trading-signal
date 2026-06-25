import { useMemo } from 'react'
import { RecommendationsFeed } from '@/features/dashboard/components/RecommendationsFeed'
import { RecommendationsToolbar } from '@/features/dashboard/components/RecommendationsToolbar'
import { useRecommendationFilters } from '@/features/dashboard/hooks/useRecommendationFilters'
import { useRecommendations } from '@/features/dashboard/hooks/useRecommendations'
import {
  applyRecommendationFilters,
  listRecommendationSectors,
} from '@/features/dashboard/lib/recommendationFilters'
import type { RecommendationsTabProps } from './types'

const FILTERED_EMPTY_MESSAGE = 'No market ideas match your filters. Try adjusting or clearing them.'

/** Market ideas tab backed by the dashboard recommendations API. */
function RecommendationsTab({
  onAddToWatchlist,
  savingSymbol,
  watchlistName,
}: RecommendationsTabProps) {
  const {
    filters,
    hasActiveFilters,
    setSector,
    setSource,
    setAction,
    setSort,
    clearFilters,
  } = useRecommendationFilters()

  const { recommendations, isLoading, error, emptyMessage, reload } = useRecommendations()

  const sectorOptions = useMemo(
    () => listRecommendationSectors(recommendations),
    [recommendations],
  )

  const filteredRecommendations = useMemo(
    () => applyRecommendationFilters(recommendations, filters),
    [recommendations, filters],
  )

  const displayEmptyMessage =
    hasActiveFilters && filteredRecommendations.length === 0
      ? FILTERED_EMPTY_MESSAGE
      : emptyMessage

  return (
    <div className="space-y-4">
      <RecommendationsToolbar
        filters={filters}
        sectorOptions={sectorOptions}
        hasActiveFilters={hasActiveFilters}
        onSectorChange={setSector}
        onSourceChange={setSource}
        onActionChange={setAction}
        onSortChange={setSort}
        onClearFilters={clearFilters}
      />

      <RecommendationsFeed
        recommendations={filteredRecommendations}
        isLoading={isLoading}
        error={error}
        emptyMessage={displayEmptyMessage}
        onAddToWatchlist={onAddToWatchlist}
        savingSymbol={savingSymbol}
        watchlistName={watchlistName}
        onRetry={() => void reload()}
      />
    </div>
  )
}

export default RecommendationsTab
