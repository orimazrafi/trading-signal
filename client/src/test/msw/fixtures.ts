import type { PriceAlert } from '@/types/alert'

/** Builds a paginated price-alerts list body matching the API contract. */
export function priceAlertsListBody(alerts: PriceAlert[]) {
  return {
    alerts,
    page: 1,
    limit: 20,
    total: alerts.length,
    hasMore: false,
  }
}
