import type { ReactNode } from 'react'
import { Button } from '@/components/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  fromRecommendationSelectValue,
  isRecommendationSortKey,
  RECOMMENDATION_SORT_KEYS,
  recommendationFilterAllValue,
  toRecommendationSelectValue,
  type RecommendationSortKey,
} from '@/features/dashboard/lib/recommendationFilters'
import {
  isRecommendationAction,
  isRecommendationSource,
  RECOMMENDATION_ACTIONS,
  RECOMMENDATION_SOURCES,
  type RecommendationAction,
  type RecommendationSource,
} from '@/types/recommendation'
import type { RecommendationsToolbarProps } from './types'

const SORT_LABELS: Record<RecommendationSortKey, string> = {
  [RECOMMENDATION_SORT_KEYS.CONFIDENCE_DESC]: 'Confidence (high → low)',
  [RECOMMENDATION_SORT_KEYS.CONFIDENCE_ASC]: 'Confidence (low → high)',
  [RECOMMENDATION_SORT_KEYS.SYMBOL_ASC]: 'Symbol (A → Z)',
  [RECOMMENDATION_SORT_KEYS.SYMBOL_DESC]: 'Symbol (Z → A)',
  [RECOMMENDATION_SORT_KEYS.ACTION]: 'Action strength',
}

const ACTION_LABELS: Record<RecommendationAction, string> = {
  STRONG_BUY: 'Strong buy',
  BUY: 'Buy',
  HOLD: 'Hold',
  SELL: 'Sell',
}

const SOURCE_LABELS: Record<RecommendationSource, string> = {
  fundamental: 'Fundamental',
  sector: 'Sector',
  technical: 'Technical',
  analyst: 'Analyst',
}

/** Filter and sort controls for the market ideas feed (synced to the URL). */
function RecommendationsToolbar({
  filters,
  sectorOptions,
  hasActiveFilters,
  onSectorChange,
  onSourceChange,
  onActionChange,
  onSortChange,
  onClearFilters,
}: RecommendationsToolbarProps) {
  const allValue = recommendationFilterAllValue()

  /** Maps a select value to a recommendation source filter. */
  const handleSourceChange = (value: string) => {
    const parsed = fromRecommendationSelectValue(value)

    if (parsed === null) {
      onSourceChange(null)
      return
    }

    if (isRecommendationSource(parsed)) {
      onSourceChange(parsed)
    }
  }

  /** Maps a select value to a recommendation action filter. */
  const handleActionChange = (value: string) => {
    const parsed = fromRecommendationSelectValue(value)

    if (parsed === null) {
      onActionChange(null)
      return
    }

    if (isRecommendationAction(parsed)) {
      onActionChange(parsed)
    }
  }

  /** Maps a select value to a recommendation sort key. */
  const handleSortChange = (value: string) => {
    if (isRecommendationSortKey(value)) {
      onSortChange(value)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect
          label="Sector"
          value={toRecommendationSelectValue(filters.sector)}
          onValueChange={(value) => onSectorChange(fromRecommendationSelectValue(value))}
        >
          <SelectItem value={allValue}>All sectors</SelectItem>
          {sectorOptions.map((sector) => (
            <SelectItem key={sector} value={sector}>
              {sector}
            </SelectItem>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Source"
          value={toRecommendationSelectValue(filters.source)}
          onValueChange={handleSourceChange}
        >
          <SelectItem value={allValue}>All sources</SelectItem>
          {Object.values(RECOMMENDATION_SOURCES).map((source) => (
            <SelectItem key={source} value={source}>
              {SOURCE_LABELS[source]}
            </SelectItem>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Action"
          value={toRecommendationSelectValue(filters.action)}
          onValueChange={handleActionChange}
        >
          <SelectItem value={allValue}>All actions</SelectItem>
          {Object.values(RECOMMENDATION_ACTIONS).map((action) => (
            <SelectItem key={action} value={action}>
              {ACTION_LABELS[action]}
            </SelectItem>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Sort by"
          value={filters.sort}
          onValueChange={handleSortChange}
        >
          {Object.entries(SORT_LABELS).map(([sortKey, label]) => (
            <SelectItem key={sortKey} value={sortKey}>
              {label}
            </SelectItem>
          ))}
        </FilterSelect>
      </div>

      {hasActiveFilters ? (
        <div>
          <Button type="button" variant="secondary" onClick={onClearFilters}>
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  )
}

type FilterSelectProps = {
  label: string
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
}

/** Labeled select field used in the recommendations toolbar. */
function FilterSelect({ label, value, onValueChange, children }: FilterSelectProps) {
  return (
    <label className="flex min-w-[10rem] flex-1 flex-col gap-1.5 text-left text-xs font-medium text-muted-foreground">
      {label}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </label>
  )
}

export default RecommendationsToolbar
