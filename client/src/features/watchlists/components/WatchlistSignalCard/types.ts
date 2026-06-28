import type { SignalCardProps } from '@/features/dashboard/components/SignalCard/types'
import type { Signal } from '@/types/watchlist'

export type WatchlistSignalCardProps = Omit<SignalCardProps, 'signal'> & {
  signal: Signal
}
