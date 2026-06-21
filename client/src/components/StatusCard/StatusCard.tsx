import styles from './StatusCard.module.css'
import type { StatusCardProps } from './types'

/** Displays backend health status for the signed-in dashboard. */
export function StatusCard({ health, error, loading }: StatusCardProps) {
  return (
    <section className={styles.card}>
      <h2>API status</h2>
      {health && (
        <p className={styles.ok}>
          {health.service}: {health.status}
        </p>
      )}
      {error && <p className={styles.error}>Error: {error}</p>}
      {loading && !health && !error && <p>Checking backend...</p>}
    </section>
  )
}

