/** Primary dashboard section tabs. */
export type DashboardTab = 'news' | 'recommendations' | 'watchlist'

export type DashboardNavProps = {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
}
