import type { StockRecommendation } from '../../../../types/recommendation'
import { RecommendationFactors } from './RecommendationFactors'
import {
  formatRecommendationAction,
  formatRecommendationSource,
  recommendationBadgeClass,
} from './recommendationUtils'

export type RecommendationCardProps = {
  recommendation: StockRecommendation
}

/** Renders a single stock recommendation card with factor breakdown. */
export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {recommendation.symbol}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {recommendation.name} · {recommendation.sector}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${recommendationBadgeClass(recommendation.action)}`}
        >
          {formatRecommendationAction(recommendation.action)}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{recommendation.summary}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Price</dt>
          <dd className="font-semibold text-slate-900 dark:text-slate-100">
            ${recommendation.price.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Confidence</dt>
          <dd className="font-semibold text-slate-900 dark:text-slate-100">
            {recommendation.confidence}%
          </dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Primary signal</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">
            {formatRecommendationSource(recommendation.primarySource)}
          </dd>
        </div>
      </dl>

      <RecommendationFactors factors={recommendation.factors} />
    </article>
  )
}
