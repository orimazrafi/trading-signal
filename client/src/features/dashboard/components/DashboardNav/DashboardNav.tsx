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
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </Button>
        )
      })}
    </nav>
  )
}

export default DashboardNav
