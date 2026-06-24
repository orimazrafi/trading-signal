import { lazy, Suspense, useState } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { AppHeader } from '@/components/AppHeader'
import { DashboardNav, type DashboardTab } from '@/features/dashboard/components/DashboardNav'
import { useNewsFeed } from '@/features/dashboard/hooks/useNewsFeed'
import type { DashboardProps } from '@/features/dashboard/types'
import { useQuickAddToWatchlist } from '@/features/watchlists/hooks/useQuickAddToWatchlist'
import { useAlertStream } from '@/hooks/useAlertStream'
import { TAB_ERROR_TITLE, TAB_LOADING_LABEL } from './types'

const AlertsTab = lazy(() => import('@/features/dashboard/tabs/AlertsTab'))
const NewsTab = lazy(() => import('@/features/dashboard/tabs/NewsTab'))
const RecommendationsTab = lazy(() => import('@/features/dashboard/tabs/RecommendationsTab'))
const WatchlistTab = lazy(() => import('@/features/dashboard/tabs/WatchlistTab'))

/** Signed-in dashboard shell with primary section tabs. */
function DashboardLayout({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('news')
  const { news, isLoading: newsLoading, error: newsError } = useNewsFeed()
  const {
    quickAdd,
    savingSymbol,
    watchlistName,
    watchlistSymbols,
  } = useQuickAddToWatchlist(user.userId)

  useAlertStream(true)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-4 py-6 text-left">
      <AppHeader email={user.email} onLogout={onLogout} />
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

      <ErrorBoundary key={activeTab} title={TAB_ERROR_TITLE[activeTab]}>
        <Suspense fallback={<LoadingSpinner label={TAB_LOADING_LABEL[activeTab]} />}>
          {activeTab === 'news' ? (
            <NewsTab
              news={news}
              isLoading={newsLoading}
              error={newsError}
              watchlistSymbols={watchlistSymbols}
              onAddToWatchlist={quickAdd}
              savingSymbol={savingSymbol}
              watchlistName={watchlistName}
            />
          ) : null}
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
  