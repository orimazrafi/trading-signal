import type { RecommendationFactor } from '@/types/recommendation'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
    <ul className="mt-4 space-y-2 border-t border-border pt-3">
      {factors.map((factor) => (
        <li
          key={`${factor.source}-${factor.label}`}
          className="flex items-center justify-between gap-3 text-xs"
        >
          <span className="text-muted-foreground">
            {factor.weight !== undefined ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help underline decoration-dotted underline-offset-2">
                    {Math.round(factor.weight * 100)}%
                  </span>
                </TooltipTrigger>
                <TooltipContent>Weight in the overall score</TooltipContent>
              </Tooltip>
            ) : null}
            {factor.weight !== undefined ? ' · ' : ''}
            {formatRecommendationSource(factor.source)} · {factor.label}
          </span>
          <span className="font-medium text-foreground">{factor.value}</span>
        </li>
      ))}
    </ul>
  )
}

export default RecommendationFactors
