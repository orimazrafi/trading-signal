import { Button } from '@/components/Button'
import {
  CHART_OVERLAY_COLOR_VARS,
  type ChartOverlayVisibility,
} from '@/features/stocks/lib/chartOverlayVisibility'
import {
  CHART_OVERLAY_KEYS,
  CHART_OVERLAY_LABELS,
  type ChartOverlayKey,
} from '@/features/stocks/lib/chartIndicatorSeries'
import { cn } from '@/lib/utils'

const OVERLAY_TOGGLE_ORDER: ChartOverlayKey[] = [
  CHART_OVERLAY_KEYS.SMA20,
  CHART_OVERLAY_KEYS.SMA50,
  CHART_OVERLAY_KEYS.EMA12,
]

type ChartOverlayTogglesProps = {
  visibility: ChartOverlayVisibility
  onToggle: (key: ChartOverlayKey) => void
}

/** Toggle buttons to show or hide moving-average lines on the stock chart. */
function ChartOverlayToggles({ visibility, onToggle }: ChartOverlayTogglesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Chart indicators">
      <span className="text-sm text-muted-foreground">Indicators</span>
      {OVERLAY_TOGGLE_ORDER.map((key) => {
        const isActive = visibility[key]

        return (
          <Button
            key={key}
            type="button"
            variant={isActive ? 'tabActive' : 'tab'}
            className={cn('h-8 flex-none px-2.5 py-1 text-xs', !isActive && 'opacity-70')}
            aria-pressed={isActive}
            onClick={() => onToggle(key)}
          >
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  'inline-block h-0.5 w-3 rounded-full transition-opacity',
                  !isActive && 'opacity-40',
                )}
                style={{ backgroundColor: `var(${CHART_OVERLAY_COLOR_VARS[key]})` }}
                aria-hidden="true"
              />
              {CHART_OVERLAY_LABELS[key]}
            </span>
          </Button>
        )
      })}
    </div>
  )
}

export default ChartOverlayToggles
