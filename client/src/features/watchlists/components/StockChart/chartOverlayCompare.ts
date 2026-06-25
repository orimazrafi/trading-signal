import type { ChartOverlayKey, ChartLineOverlay } from '@/features/stocks/lib/chartIndicatorSeries'
import type { ChartOverlayVisibility } from '@/features/stocks/lib/chartOverlayVisibility'
import { chartTimesEqual } from '@/features/stocks/lib/chartSeries'

/** Returns true when overlay visibility maps are equivalent. */
export function chartOverlayVisibilityEqual(
  previous: ChartOverlayVisibility | undefined,
  next: ChartOverlayVisibility | undefined,
): boolean {
  if (previous === next) {
    return true
  }

  if (!previous || !next) {
    return false
  }

  const keys = Object.keys(previous) as ChartOverlayKey[]

  return keys.every((key) => previous[key] === next[key])
}

/** Returns true when two overlay snapshots end at the same indicator values. */
export function chartOverlaysFingerprintsEqual(
  previous: readonly ChartLineOverlay[] | undefined,
  next: readonly ChartLineOverlay[] | undefined,
): boolean {
  if (previous === next) {
    return true
  }

  const previousOverlays = previous ?? []
  const nextOverlays = next ?? []

  if (previousOverlays.length !== nextOverlays.length) {
    return false
  }

  for (let index = 0; index < previousOverlays.length; index += 1) {
    const previousOverlay = previousOverlays[index]
    const nextOverlay = nextOverlays[index]

    if (!previousOverlay || !nextOverlay || previousOverlay.key !== nextOverlay.key) {
      return false
    }

    const previousLast = previousOverlay.data[previousOverlay.data.length - 1]
    const nextLast = nextOverlay.data[nextOverlay.data.length - 1]

    if (!previousLast && !nextLast) {
      continue
    }

    if (!previousLast || !nextLast) {
      return false
    }

    if (
      !chartTimesEqual(previousLast.time, nextLast.time) ||
      previousLast.value !== nextLast.value
    ) {
      return false
    }
  }

  return true
}
