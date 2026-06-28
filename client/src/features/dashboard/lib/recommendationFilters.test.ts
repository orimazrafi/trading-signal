import { describe, expect, it } from 'vitest'
import type { StockRecommendation } from '@/types/recommendation'
import {
  applyRecommendationFilters,
  buildRecommendationSearchParams,
  parseRecommendationUrlFilters,
  RECOMMENDATION_SORT_KEYS,
} from './recommendationFilters'

function createRecommendation(
  overrides: Partial<StockRecommendation> & Pick<StockRecommendation, 'symbol' | 'sector' | 'action' | 'confidence'>,
): StockRecommendation {
  return {
    id: overrides.symbol,
    name: overrides.symbol,
    price: 100,
    primarySource: 'fundamental',
    summary: 'Test summary',
    factors: [{ source: 'fundamental', label: 'P/E', value: '20' }],
    generatedAt: '2026-06-24T12:00:00.000Z',
    ...overrides,
  }
}

const recommendations: StockRecommendation[] = [
  createRecommendation({
    symbol: 'AAPL',
    sector: 'Technology',
    action: 'BUY',
    confidence: 80,
    primarySource: 'fundamental',
  }),
  createRecommendation({
    symbol: 'XOM',
    sector: 'Energy',
    action: 'HOLD',
    confidence: 60,
    primarySource: 'sector',
    factors: [{ source: 'sector', label: 'Sector', value: 'Energy' }],
  }),
]

describe('parseRecommendationUrlFilters', () => {
  it('parses sector, source, action, and sort from search params', () => {
    const filters = parseRecommendationUrlFilters(
      new URLSearchParams('sector=Energy&source=sector&action=hold&sort=symbol-asc'),
    )

    expect(filters).toEqual({
      sector: 'Energy',
      source: 'sector',
      action: 'HOLD',
      sort: RECOMMENDATION_SORT_KEYS.SYMBOL_ASC,
    })
  })

  it('falls back to defaults for invalid values', () => {
    expect(parseRecommendationUrlFilters(new URLSearchParams('sort=invalid'))).toEqual({
      sector: null,
      source: null,
      action: null,
      sort: RECOMMENDATION_SORT_KEYS.CONFIDENCE_DESC,
    })
  })
})

describe('buildRecommendationSearchParams', () => {
  it('omits default sort and encodes active filters', () => {
    const params = buildRecommendationSearchParams({
      sector: 'Energy',
      source: 'sector',
      action: 'HOLD',
      sort: RECOMMENDATION_SORT_KEYS.SYMBOL_ASC,
    })

    expect(params.toString()).toBe('sector=Energy&source=sector&action=HOLD&sort=symbol-asc')
  })
})

describe('applyRecommendationFilters', () => {
  it('filters by sector and sorts by confidence descending', () => {
    const filtered = applyRecommendationFilters(recommendations, {
      sector: 'energy',
      source: null,
      action: null,
      sort: RECOMMENDATION_SORT_KEYS.CONFIDENCE_DESC,
    })

    expect(filtered.map((item) => item.symbol)).toEqual(['XOM'])
  })

  it('filters by action and source factor matches', () => {
    const filtered = applyRecommendationFilters(recommendations, {
      sector: null,
      source: 'fundamental',
      action: 'BUY',
      sort: RECOMMENDATION_SORT_KEYS.CONFIDENCE_DESC,
    })

    expect(filtered.map((item) => item.symbol)).toEqual(['AAPL'])
  })
})
