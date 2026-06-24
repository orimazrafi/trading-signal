import { lazy, Suspense, useState } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { AppHeader } from '@/components/AppHeader'
import AlertStreamListener from '@/features/alerts/components/AlertStreamListener'
import { DashboardNav, type DashboardTab } from '@/features/dashboard/components/DashboardNav'
import type { DashboardProps } from '@/features/dashboard/types'
import { useQuickAddToWatchlist } from '@/features/watchlists/hooks/useQuickAddToWatchlist'
import { TAB_ERROR_TITLE, TAB_LOADING_LABEL } from './types'

const AlertsTab = lazy(() => import('@/features/dashboard/tabs/AlertsTab'))
const NewsTab = lazy(() => import('@/features/dashboard/tabs/NewsTab'))
const RecommendationsTab = lazy(() => import('@/features/dashboard/tabs/RecommendationsTab'))
const WatchlistTab = lazy(() => import('@/features/dashboard/tabs/WatchlistTab'))

/** Signed-in dashboard shell with primary section tabs. */
function DashboardLayout({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('news')
  const {
    quickAdd,
    savingSymbol,
    watchlistName,
  } = useQuickAddToWatchlist(user.userId)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-4 py-6 text-left">
      <AlertStreamListener />
      <AppHeader email={user.email} onLogout={onLogout} />
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

      <ErrorBoundary key={activeTab} title={TAB_ERROR_TITLE[activeTab]}>
        <Suspense fallback={<LoadingSpinner label={TAB_LOADING_LABEL[activeTab]} />}>
          {activeTab === 'news' ? <NewsTab userId={user.userId} /> : null}
          {activeTab === 'recommendations' ? (
            <RecommendationsTab
              onAddToWatchlist={quickAdd}
              savingSymbol={savingSymbol}
              watchlistName={watchlistName}
            />
          ) : null}
          {activeTab === 'watchlist' ? <WatchlistTab user={user} /> : null}
          {activeTab === 'alerts' ? <AlertsTab userEmail={user.email} /> : null}
        </Suspense>
      </ErrorBoundary>
    </main>
  )
}

export default DashboardLayout
