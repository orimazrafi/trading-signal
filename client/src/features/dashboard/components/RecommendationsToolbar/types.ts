import type { RecommendationSortKey, RecommendationUrlFilters } from '@/features/dashboard/lib/recommendationFilters'
import type { RecommendationAction, RecommendationSource } from '@/types/recommendation'

export type RecommendationsToolbarProps = {
  filters: RecommendationUrlFilters
  sectorOptions: string[]
  hasActiveFilters: boolean
  onSectorChange: (sector: string | null) => void
  onSourceChange: (source: RecommendationSource | null) => void
  onActionChange: (action: RecommendationAction | null) => void
  onSortChange: (sort: RecommendationSortKey) => void
  onClearFilters: () => void
}
