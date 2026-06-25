import { RECOMMENDATION_ACTIONS, type RecommendationAction } from '@/types/recommendation'

export type GaugeColorSet = {
  stroke: string
  track: string
}

const BUY_GAUGE: GaugeColorSet = {
  stroke: 'var(--positive)',
  track: 'var(--positive-muted)',
}

const HOLD_GAUGE: GaugeColorSet = {
  stroke: 'var(--warning)',
  track: 'var(--warning-muted)',
}

const SELL_GAUGE: GaugeColorSet = {
  stroke: 'var(--negative)',
  track: 'var(--negative-muted)',
}

/** Maps a recommendation action to gauge stroke and track colors. */
export function gaugeColorsForAction(action: RecommendationAction): GaugeColorSet {
  if (action === RECOMMENDATION_ACTIONS.STRONG_BUY || action === RECOMMENDATION_ACTIONS.BUY) {
    return BUY_GAUGE
  }

  if (action === RECOMMENDATION_ACTIONS.SELL) {
    return SELL_GAUGE
  }

  return HOLD_GAUGE
}
