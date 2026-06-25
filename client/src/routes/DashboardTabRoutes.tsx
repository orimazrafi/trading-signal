import { lazy } from 'react'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { useQuickAddToWatchlist } from '@/features/watchlists/hooks/useQuickAddToWatchlist'

const AlertsTab = lazy(() => import('@/features/dashboard/tabs/AlertsTab'))
const NewsTab = lazy(() => import('@/features/dashboard/tabs/NewsTab'))
const RecommendationsTab = lazy(() => import('@/features/dashboard/tabs/RecommendationsTab'))
const WatchlistTab = lazy(() => import('@/features/dashboard/tabs/WatchlistTab'))

/** Market news tab route element. */
export function NewsTabRoute() {
  const { user } = useAuthContext()

  if (!user) {
    return null
  }

  return <NewsTab userId={user.userId} />
}

/** Market ideas tab route element. */
export function RecommendationsTabRoute() {
  const { user } = useAuthContext()
  const { quickAdd, savingSymbol, watchlistName } = useQuickAddToWatchlist(user?.userId ?? '')

  if (!user) {
    return null
  }

  return (
    <RecommendationsTab
      onAddToWatchlist={quickAdd}
      savingSymbol={savingSymbol}
      watchlistName={watchlistName}
    />
  )
}

/** Watchlist tab route element. */
export function WatchlistTabRoute() {
  const { user } = useAuthContext()

  if (!user) {
    return null
  }

  return <WatchlistTab user={user} />
}

/** Price alerts tab route element. */
export function AlertsTabRoute() {
  const { user } = useAuthContext()

  if (!user) {
    return null
  }

  return <AlertsTab userEmail={user.email} />
}
