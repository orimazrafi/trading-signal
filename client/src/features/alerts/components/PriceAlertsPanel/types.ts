import type { PriceAlert } from '@/types/alert'

export type PriceAlertsPanelProps = {
  userEmail: string
  alerts: PriceAlert[]
  loading: boolean
  creating: boolean
  updating: boolean
  deleting: boolean
  error: string | null
  onCreate: (symbol: string, thresholdPercent: number, emailEnabled: boolean) => Promise<void>
  onToggleEnabled: (alert: PriceAlert, enabled: boolean) => Promise<void>
  onToggleEmail: (alert: PriceAlert, emailEnabled: boolean) => Promise<void>
  onDelete: (alertId: string) => Promise<void>
}
