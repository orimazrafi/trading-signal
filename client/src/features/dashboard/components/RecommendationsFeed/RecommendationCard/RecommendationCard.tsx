import { Badge } from '@/components/Badge'
import { Card } from '@/components/Card'
import { ConfidenceGauge } from '@/components/ConfidenceGauge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { SimulatedLivePrice } from '@/components/SimulatedLivePrice'
import { StockLogo } from '@/components/StockLogo'
import { AddToWatchlistButton } from '@/features/watchlists/components/AddToWatchlistButton'
import type { RecommendationCardProps } from './types'
import RecommendationFactors from '../RecommendationFactors'
import {
  formatRecommendationAction,
  formatRecommendationSource,
  recommendationBadgeVariant,
} from '../recommendationUtils'

/** Renders a single market idea card with factor breakdown. */
function RecommendationCard({
  recommendation,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist = false,
  saving = false,
  watchlistName,
  liveQuote = null,
  liveQuoteLoading = false,
  liveQuoteSyncedAtMs = null,
}: RecommendationCardProps) {
  const isHoldIdea = recommendation.action === 'HOLD'
  const displayPrice = liveQuote?.price ?? recommendation.price
  const showSimulatedLive = liveQuote !== null && liveQuoteSyncedAtMs !== null

  return (
    <Card
      variant="muted"
      className={`shadow-none ${isHoldIdea ? 'bg-muted/80' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <StockLogo symbol={recommendation.symbol} size="lg" />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground">
              {recommendation.symbol}
            </h3>
            <p className="text-sm text-muted-foreground">
              {recommendation.name} · {recommendation.sector}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge variant={recommendationBadgeVariant(recommendation.action)}>
            {formatRecommendationAction(recommendation.action)}
          </Badge>
          <ConfidenceGauge value={recommendation.confidence} action={recommendation.action} />
        </div>
      </div>

      <p className="mt-3 text-sm text-foreground/90">{recommendation.summary}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Price</dt>
          <dd className="font-semibold text-foreground">
            {liveQuoteLoading ? (
              <LoadingSpinner label="Loading live quote…" className="py-1" />
            ) : showSimulatedLive ? (
              <SimulatedLivePrice
                price={displayPrice}
                lastSyncedAtMs={liveQuoteSyncedAtMs}
                className="text-base"
              />
            ) : (
              <>${recommendation.price.toFixed(2)}</>
            )}
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
            onRemove={onRemoveFromWatchlist}
            isInWatchlist={isInWatchlist}
            saving={saving}
            removing={saving}
            watchlistName={watchlistName}
          />
        </div>
      ) : null}
    </Card>
  )
}

export default RecommendationCard
