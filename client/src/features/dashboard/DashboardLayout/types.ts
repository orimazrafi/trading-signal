import type { DashboardTab } from '@/features/dashboard/components/DashboardNav/types'

/** Suspense fallback copy while a dashboard tab chunk loads. */
export const TAB_LOADING_LABEL: Record<DashboardTab, string> = {
  news: 'Loading news...',
  recommendations: 'Loading recommendations...',
  watchlist: 'Loading watchlist...',
  alerts: 'Loading alerts...',
}

/** Error boundary title when a dashboard tab fails to render. */
export const TAB_ERROR_TITLE: Record<DashboardTab, string> = {
  news: 'News failed to load',
  recommendations: 'Recommendations failed to load',
  watchlist: 'Watchlist failed to load',
  alerts: 'Alerts failed to load',
}
