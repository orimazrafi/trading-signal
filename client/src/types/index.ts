export type { Signal, SignalAction, Watchlist } from './watchlist'

export { SIGNAL_ACTIONS, isSignalAction } from '@trading-signal/contracts/signal'

export type { MarketNewsArticle, MarketNewsResponse, NewsSentiment } from './news'

export type {

  RecommendationAction,

  RecommendationFactor,

  RecommendationSource,

  RecommendationsResponse,

  StockRecommendation,

} from './recommendation'

export {

  RECOMMENDATION_ACTIONS,

  RECOMMENDATION_SOURCES,

  isRecommendationAction,

  isRecommendationSource,

} from './recommendation'

export type { StockQuote, SearchStockResult, StockHistory, StockHistoryPoint, StockHistoryRange } from './stock'

export {
  STOCK_HISTORY_RANGES,
  isStockHistoryRange,
  parseSearchStockResult,
  parseStockHistory,
  parseStockHistoryPoint,
  parseStockQuote,
} from '@trading-signal/contracts/stock'

export type {
  AlertNotification,
  AlertNotificationEvent,
  CreatePriceAlertInput,
  PriceAlert,
  UpdatePriceAlertInput,
} from './alert'

export {
  ALERT_MAX_THRESHOLD_PERCENT,
  ALERT_MIN_THRESHOLD_PERCENT,
  MAX_ALERTS_PER_USER,
  MAX_PRICE_ALERTS,
} from './alert'

