import { Badge } from '@/components/Badge'
import { Card } from '@/components/Card'
import { AddToWatchlistButton } from '@/features/watchlists/components/AddToWatchlistButton'
import RecommendationFactors from '../RecommendationFactors'
import {
  formatRecommendationAction,
  formatRecommendationSource,
  recommendationBadgeVariant,
} from '../recommendationUtils'
import type { RecommendationCardProps } from './types'

/** Renders a single market idea card with factor breakdown. */
function RecommendationCard({
  recommendation,
  onAddToWatchlist,
  saving = false,
  watchlistName,
}: RecommendationCardProps) {
  const isHoldIdea = recommendation.action === 'HOLD'

  return (
    <Card
      variant="muted"
      className={`shadow-none ${isHoldIdea ? 'bg-muted/80' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {recommendation.symbol}
          </h3>
          <p className="text-sm text-muted-foreground">
            {recommendation.name} · {recommendation.sector}
          </p>
        </div>
        <Badge variant={recommendationBadgeVariant(recommendation.action)}>
          {formatRecommendationAction(recommendation.action)}
        </Badge>
      </div>

      <p className="mt-3 text-sm text-foreground/90">{recommendation.summary}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Price</dt>
          <dd className="font-semibold text-foreground">
            ${recommendation.price.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Score</dt>
          <dd className="font-semibold text-foreground">
            {recommendation.confidence}%
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Primary signal</dt>
          <dd className="font-medium text-foreground">
            {formatRecommendationSource(recommendation.primarySource)}
          </dd>
        </div>
      </dl>

      <RecommendationFactors factors={recommendation.factors} />

      {onAddToWatchlist ? (
        <div className="mt-4 border-t border-border pt-3">
          <AddToWatchlistButton
            symbol={recommendation.symbol}
            onAdd={onAddToWatchlist}
            saving={saving}
            watchlistName={watchlistName}
          />
        </div>
      ) : null}
    </Card>
  )
}

export default RecommendationCard
