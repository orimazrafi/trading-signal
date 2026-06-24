import { DashboardLayout } from '@/features/dashboard/DashboardLayout'
import type { DashboardProps } from '@/features/dashboard/types'

/** Signed-in home view with watchlists and stock search. */
function Dashboard(props: DashboardProps) {
  return <DashboardLayout {...props} />
}

export default Dashboard
