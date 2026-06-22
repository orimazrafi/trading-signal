import type { StockRecommendation } from '../../../../types/recommendation'
import { LoadingSpinner } from '../LoadingSpinner'
import { RecommendationCard } from './RecommendationCard'

export type RecommendationsFeedProps = {
  recommendations: StockRecommendation[]
  isLoading: boolean
  error: string | null
}

/** Renders the dashboard recommendations list with factor breakdowns. */
export function RecommendationsFeed({
  recommendations,
  isLoading,
  error,
}: RecommendationsFeedProps) {
  const hasRecommendations = !isLoading && !error && recommendations.length > 0
  const isEmpty = !isLoading && !error && recommendations.length === 0

  return (
    <section className="flex min-h-[calc(100vh-14rem)] flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <header className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Stock Recommendations
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Actionable picks scored by fundamental and sector analysis
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {isLoading ? <LoadingSpinner label="Loading recommendations…" /> : null}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        ) : null}

        {isEmpty ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
            No recommendations yet. Run the recommendations worker or{' '}
            <code className="text-xs">npm run recommendations:refresh</code> in the server.
          </p>
        ) : null}

        {hasRecommendations ? (
          <ul className="space-y-3">
            {recommendations.map((recommendation) => (
              <li key={recommendation.id}>
                <RecommendationCard recommendation={recommendation} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
