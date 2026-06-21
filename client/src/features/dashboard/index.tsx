import { AppHeader } from '../../components/AppHeader'
import { StatusCard } from '../../components/StatusCard'
import styles from './Dashboard.module.css'
import type { DashboardProps } from './types'
import { useHealth } from './useHealth'

/** Signed-in home view with API health status. */
export function Dashboard({ user, onLogout }: DashboardProps) {
  const healthQuery = useHealth(true)
  const healthError = healthQuery.error instanceof Error ? healthQuery.error.message : null

  return (
    <main className={styles.app}>
      <AppHeader email={user.email} onLogout={onLogout} />
      <StatusCard health={healthQuery.data} error={healthError} loading={healthQuery.isLoading} />
    </main>
  )
}

export { useHealth } from './useHealth'
export type { DashboardProps } from './types'
