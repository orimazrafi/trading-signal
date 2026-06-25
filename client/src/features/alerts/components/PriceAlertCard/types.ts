import type { PriceAlert } from '@/types/alert'

export type PriceAlertCardProps = {
  alert: PriceAlert
  userEmail: string
  updating: boolean
  deleting: boolean
  onToggleEnabled: (alert: PriceAlert, enabled: boolean) => Promise<PriceAlert | void>
  onToggleEmail: (alert: PriceAlert, emailEnabled: boolean) => Promise<PriceAlert | void>
  onDelete: (alertId: string) => Promise<void>
}
