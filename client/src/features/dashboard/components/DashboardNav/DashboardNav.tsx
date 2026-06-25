import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { ROUTES } from '@/routes/paths'
import type { DashboardNavProps, DashboardTab } from './types'

const TABS: Array<{ id: DashboardTab; label: string }> = [
  { id: 'news', label: 'Market News' },
  { id: 'recommendations', label: 'Market Ideas' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'alerts', label: 'Alerts' },
]

const TAB_ROUTES: Record<DashboardTab, string> = {
  news: ROUTES.dashboard,
  recommendations: ROUTES.recommendations,
  watchlist: ROUTES.watchlist,
  alerts: ROUTES.alerts,
}

/** Primary navigation between dashboard sections. */
function DashboardNav({ activeTab }: DashboardNavProps) {
  const navigate = useNavigate()
  const location = useLocation()

  /** Navigates to a dashboard section, preserving the watchlist symbol when already on watchlist. */
  const handleTabChange = (tab: DashboardTab) => {
    if (tab === 'watchlist' && location.pathname.startsWith(`${ROUTES.watchlist}/`)) {
      navigate(location.pathname)
      return
    }

    navigate(TAB_ROUTES[tab])
  }

  return (
    <nav
      className="flex gap-1 rounded-xl border border-border bg-muted/80 p-1"
      aria-label="Dashboard sections"
      role="tablist"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id

        return (
          <Button
            key={tab.id}
            variant={isActive ? 'tabActive' : 'tab'}
            fullWidth
            role="tab"
            aria-selected={isActive}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </Button>
        )
      })}
    </nav>
  )
}

export default DashboardNav
