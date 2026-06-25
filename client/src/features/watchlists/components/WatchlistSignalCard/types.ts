import type { Signal } from '@/types/watchlist'
import type { SignalCardProps } from '@/features/dashboard/components/SignalCard/types'

export type WatchlistSignalCardProps = Omit<SignalCardProps, 'signal'> & {
  signal: Signal
}
