import type { ChartTooltipPayload } from '@/features/stocks/lib/chartOverlayVisibility'
import { formatChartTooltipPrice } from '@/features/stocks/lib/chartOverlayVisibility'

type StockChartTooltipProps = {
  payload: ChartTooltipPayload | null
  position: { x: number; y: number } | null
}

/** Floating crosshair tooltip for price and visible indicator values. */
function StockChartTooltip({ payload, position }: StockChartTooltipProps) {
  if (!payload || !position) {
    return null
  }

  return (
    <div
      className="pointer-events-none absolute z-20 min-w-[10rem] rounded-lg border border-border bg-card/95 px-3 py-2 text-xs shadow-panel backdrop-blur-sm"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(12px, -50%)',
      }}
      role="tooltip"
    >
      <p className="mb-1.5 font-medium text-foreground">{payload.timeLabel}</p>
      <p className="text-muted-foreground">
        Price{' '}
        <span className="font-semibold text-foreground">
          {formatChartTooltipPrice(payload.price)}
        </span>
      </p>
      {payload.overlays.length > 0 ? (
        <ul className="mt-1.5 space-y-1 border-t border-border pt-1.5">
          {payload.overlays.map((overlay) => (
            <li key={overlay.key} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="inline-block h-0.5 w-3 rounded-full"
                  style={{ backgroundColor: `var(${overlay.colorVar})` }}
                  aria-hidden="true"
                />
                {overlay.label}
              </span>
              <span className="font-medium text-foreground">
                {formatChartTooltipPrice(overlay.value)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default StockChartTooltip
