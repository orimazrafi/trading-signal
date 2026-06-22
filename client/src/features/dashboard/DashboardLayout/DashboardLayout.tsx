import { useState } from 'react'
import { AppHeader } from '../../../components/AppHeader'
import { DashboardNav, type DashboardTab } from '../components/DashboardNav'
import { useNewsFeed } from '../hooks/useNewsFeed'
import type { DashboardProps } from '../types'
import { NewsTab } from '../tabs/NewsTab'
import { RecommendationsTab } from '../tabs/RecommendationsTab'
import { WatchlistTab } from '../tabs/WatchlistTab'

/** Signed-in dashboard shell with primary section tabs. */
export function DashboardLayout({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('news')
  const { news, isLoading: newsLoading, error: newsError } = useNewsFeed()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-4 py-6 text-left">
      <AppHeader email={user.email} onLogout={onLogout} />
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'news' ? (
        <NewsTab news={news} isLoading={newsLoading} error={newsError} />
      ) : null}
      {activeTab === 'recommendations' ? <RecommendationsTab /> : null}
      {activeTab === 'watchlist' ? <WatchlistTab user={user} /> : null}
    </main>
  )
}
