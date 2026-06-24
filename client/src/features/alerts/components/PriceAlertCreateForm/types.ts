import type { PriceAlert } from '@/types/alert'

export type PriceAlertCreateFormProps = {
  userEmail: string
  creating: boolean
  onCreate: (symbol: string, thresholdPercent: number, emailEnabled: boolean) => Promise<PriceAlert | void>
}
