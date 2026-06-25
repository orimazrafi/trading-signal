import type { Signal } from '@/types/watchlist'

export type SignalCardProps = {
  signal: Signal
  isSelected?: boolean
  onSelect?: (symbol: string) => void
  onRemove?: (signalId: string) => void
  removing?: boolean
  liveQuoteSyncedAtMs?: number | null
  className?: string
}
