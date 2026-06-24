import { Button } from '@/components/Button'
import type { DashboardNavProps, DashboardTab } from './types'

const TABS: Array<{ id: DashboardTab; label: string }> = [
  { id: 'news', label: 'Market News' },
  { id: 'recommendations', label: 'Market Ideas' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'alerts', label: 'Alerts' },
]

/** Primary navigation between dashboard sections. */
function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
  return (
    <nav
      className="flex gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-900/60"
      aria-label="Dashboard sections"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id

        return (
          <Button
            key={tab.id}
            variant={isActive ? 'tabActive' : 'tab'}
            fullWidth
            onClick={() => onTabChange(tab.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}
          </Button>
        )
      })}
    </nav>
  )
}

export default DashboardNav
