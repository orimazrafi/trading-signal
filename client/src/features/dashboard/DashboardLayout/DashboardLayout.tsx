import { useState } from 'react'
import { useAlertStream } from '@/hooks/useAlertStream'
import { AppHeader } from '@/components/AppHeader'
import { DashboardNav, type DashboardTab } from '@/features/dashboard/components/DashboardNav'
import { useNewsFeed } from '@/features/dashboard/hooks/useNewsFeed'
import type { DashboardProps } from '@/features/dashboard/types'
import AlertsTab from '@/features/dashboard/tabs/AlertsTab'
import NewsTab from '@/features/dashboard/tabs/NewsTab'
import RecommendationsTab from '@/features/dashboard/tabs/RecommendationsTab'
import WatchlistTab from '@/features/dashboard/tabs/WatchlistTab'

/** Signed-in dashboard shell with primary section tabs. */
function DashboardLayout({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('news')
  const { news, isLoading: newsLoading, error: newsError } = useNewsFeed()

  useAlertStream(true)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-4 py-6 text-left">
      <AppHeader email={user.email} onLogout={onLogout} />
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'news' ? (
        <NewsTab news={news} isLoading={newsLoading} error={newsError} />
      ) : null}
      {activeTab === 'recommendations' ? <RecommendationsTab /> : null}
      {activeTab === 'watchlist' ? <WatchlistTab user={user} /> : null}
      {activeTab === 'alerts' ? <AlertsTab userEmail={user.email} /> : null}
    </main>
  )
}

export default DashboardLayout
