import type { RecommendationFactor } from '@/types/recommendation'
import { formatRecommendationSource } from './recommendationUtils'

export type RecommendationFactorsProps = {
  factors: RecommendationFactor[]
}

/** Lists scoring factors for a single recommendation card. */
function RecommendationFactors({ factors }: RecommendationFactorsProps) {
  if (factors.length === 0) {
    return null
  }

  return (
    <ul className="mt-4 space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
      {factors.map((factor) => (
        <li
          key={`${factor.source}-${factor.label}`}
          className="flex items-center justify-between gap-3 text-xs"
        >
          <span className="text-slate-500 dark:text-slate-400">
            {formatRecommendationSource(factor.source)} · {factor.label}
          </span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{factor.value}</span>
        </li>
      ))}
    </ul>
  )
}

export default RecommendationFactors
