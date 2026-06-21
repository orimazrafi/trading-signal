import { DashboardLayout } from '../DashboardLayout'
import type { DashboardProps } from '../types'

/** Signed-in home view with watchlists and stock search. */
export function Dashboard(props: DashboardProps) {
  return <DashboardLayout {...props} />
}
