import type { RecommendationAction } from '@/types/recommendation'

export type ConfidenceGaugeProps = {
  value: number
  action: RecommendationAction
  label?: string
}
