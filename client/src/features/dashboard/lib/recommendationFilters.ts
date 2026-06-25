import {
  isRecommendationAction,
  isRecommendationSource,
  type RecommendationAction,
  type RecommendationSource,
  type StockRecommendation,
} from '@/types/recommendation'

export const RECOMMENDATION_SORT_KEYS = {
  CONFIDENCE_DESC: 'confidence-desc',
  CONFIDENCE_ASC: 'confidence-asc',
  SYMBOL_ASC: 'symbol-asc',
  SYMBOL_DESC: 'symbol-desc',
  ACTION: 'action',
} as const

export type RecommendationSortKey =
  (typeof RECOMMENDATION_SORT_KEYS)[keyof typeof RECOMMENDATION_SORT_KEYS]

export const DEFAULT_RECOMMENDATION_SORT = RECOMMENDATION_SORT_KEYS.CONFIDENCE_DESC

const recommendationSortValues = new Set<string>(Object.values(RECOMMENDATION_SORT_KEYS))

export type RecommendationUrlFilters = {
  sector: string | null
  source: RecommendationSource | null
  action: RecommendationAction | null
  sort: RecommendationSortKey
}

const ALL_FILTER_VALUE = 'all'

/** Returns true when value is a supported recommendation sort key. */
export function isRecommendationSortKey(value: string): value is RecommendationSortKey {
  return recommendationSortValues.has(value)
}

/** Parses recommendation filter state from URL search params. */
export function parseRecommendationUrlFilters(searchParams: URLSearchParams): RecommendationUrlFilters {
  const sector = searchParams.get('sector')?.trim() || null

  const sourceRaw = searchParams.get('source')?.trim().toLowerCase() ?? ''
  const source = isRecommendationSource(sourceRaw) ? sourceRaw : null

  const actionRaw = searchParams.get('action')?.trim().toUpperCase() ?? ''
  const action = isRecommendationAction(actionRaw) ? actionRaw : null

  const sortRaw = searchParams.get('sort')?.trim() ?? ''
  const sort = isRecommendationSortKey(sortRaw) ? sortRaw : DEFAULT_RECOMMENDATION_SORT

  return { sector, source, action, sort }
}

/** Serializes recommendation filters into URL search params (omits defaults). */
export function buildRecommendationSearchParams(filters: RecommendationUrlFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.sector) {
    params.set('sector', filters.sector)
  }

  if (filters.source) {
    params.set('source', filters.source)
  }

  if (filters.action) {
    params.set('action', filters.action)
  }

  if (filters.sort !== DEFAULT_RECOMMENDATION_SORT) {
    params.set('sort', filters.sort)
  }

  return params
}

/** Returns sorted unique sector names from a recommendations list. */
export function listRecommendationSectors(recommendations: StockRecommendation[]): string[] {
  const sectors = new Set(recommendations.map((recommendation) => recommendation.sector))
  return [...sectors].sort((left, right) => left.localeCompare(right))
}

/** Ranks recommendation actions for sort-by-action ordering. */
function recommendationActionRank(action: RecommendationAction): number {
  if (action === 'STRONG_BUY') {
    return 0
  }

  if (action === 'BUY') {
    return 1
  }

  if (action === 'HOLD') {
    return 2
  }

  return 3
}

/** Sorts recommendations by the selected URL sort key. */
export function sortRecommendations(
  recommendations: StockRecommendation[],
  sort: RecommendationSortKey,
): StockRecommendation[] {
  const sorted = [...recommendations]

  sorted.sort((left, right) => {
    if (sort === RECOMMENDATION_SORT_KEYS.CONFIDENCE_DESC) {
      return right.confidence - left.confidence
    }

    if (sort === RECOMMENDATION_SORT_KEYS.CONFIDENCE_ASC) {
      return left.confidence - right.confidence
    }

    if (sort === RECOMMENDATION_SORT_KEYS.SYMBOL_ASC) {
      return left.symbol.localeCompare(right.symbol)
    }

    if (sort === RECOMMENDATION_SORT_KEYS.SYMBOL_DESC) {
      return right.symbol.localeCompare(left.symbol)
    }

    const rankDiff =
      recommendationActionRank(left.action) - recommendationActionRank(right.action)

    if (rankDiff !== 0) {
      return rankDiff
    }

    return right.confidence - left.confidence
  })

  return sorted
}

/** Applies URL-driven filters and sort to a recommendations list. */
export function applyRecommendationFilters(
  recommendations: StockRecommendation[],
  filters: RecommendationUrlFilters,
): StockRecommendation[] {
  let filtered = recommendations

  if (filters.sector) {
    const normalizedSector = filters.sector.toLowerCase()
    filtered = filtered.filter(
      (recommendation) => recommendation.sector.toLowerCase() === normalizedSector,
    )
  }

  if (filters.source) {
    filtered = filtered.filter(
      (recommendation) =>
        recommendation.primarySource === filters.source ||
        recommendation.factors.some((factor) => factor.source === filters.source),
    )
  }

  if (filters.action) {
    filtered = filtered.filter((recommendation) => recommendation.action === filters.action)
  }

  return sortRecommendations(filtered, filters.sort)
}

/** Sentinel select value representing no filter. */
export function recommendationFilterAllValue(): string {
  return ALL_FILTER_VALUE
}

/** Maps a nullable filter to a select value. */
export function toRecommendationSelectValue(value: string | null): string {
  return value ?? ALL_FILTER_VALUE
}

/** Maps a select value back to a nullable filter. */
export function fromRecommendationSelectValue(value: string): string | null {
  return value === ALL_FILTER_VALUE ? null : value
}
