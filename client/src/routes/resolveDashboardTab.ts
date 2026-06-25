import type { DashboardTab } from '@/features/dashboard/components/DashboardNav/types'
import { ROUTES } from '@/routes/paths'

/** Maps the current pathname to the active dashboard tab. */
export function resolveDashboardTab(pathname: string): DashboardTab {
  if (pathname === ROUTES.watchlist || pathname.startsWith(`${ROUTES.watchlist}/`)) {
    return 'watchlist'
  }

  if (pathname === ROUTES.alerts || pathname.startsWith(`${ROUTES.alerts}/`)) {
    return 'alerts'
  }

  if (pathname === ROUTES.recommendations || pathname.startsWith(`${ROUTES.recommendations}/`)) {
    return 'recommendations'
  }

  return 'news'
}
