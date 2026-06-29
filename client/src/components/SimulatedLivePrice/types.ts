import type { SimulatedPriceFlashDirection } from '@/lib/simulatedLivePrice'

export type SimulatedLivePriceState = {
  displayPrice: number | null
  flashDirection: SimulatedPriceFlashDirection
  minutesSinceSync: number
}

export type SimulatedLivePriceProps = {
  price: number | null
  lastSyncedAtMs: number | null
  liveState?: SimulatedLivePriceState
  className?: string
  labelClassName?: string
}
