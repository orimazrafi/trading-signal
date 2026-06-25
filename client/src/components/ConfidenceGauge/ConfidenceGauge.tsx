import { gaugeColorsForAction } from '@/lib/recommendationGaugeColors'
import type { ConfidenceGaugeProps } from './types'

const GAUGE_RADIUS = 42
const GAUGE_STROKE = 8
const GAUGE_CENTER = 50
const GAUGE_ARC_LENGTH = Math.PI * GAUGE_RADIUS

/** Clamps confidence to a 0–100 display range. */
function clampConfidence(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

/** Renders a semi-circular confidence gauge colored by recommendation action. */
function ConfidenceGauge({ value, action, label = 'Score' }: ConfidenceGaugeProps) {
  const confidence = clampConfidence(value)
  const colors = gaugeColorsForAction(action)
  const dashOffset = GAUGE_ARC_LENGTH * (1 - confidence / 100)

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox="0 0 100 56"
        className="h-14 w-24"
        role="img"
        aria-label={`${label} ${confidence} percent`}
      >
        <path
          d={`M ${GAUGE_CENTER - GAUGE_RADIUS} ${GAUGE_CENTER} A ${GAUGE_RADIUS} ${GAUGE_RADIUS} 0 0 1 ${GAUGE_CENTER + GAUGE_RADIUS} ${GAUGE_CENTER}`}
          fill="none"
          stroke={colors.track}
          strokeWidth={GAUGE_STROKE}
          strokeLinecap="round"
        />
        <path
          d={`M ${GAUGE_CENTER - GAUGE_RADIUS} ${GAUGE_CENTER} A ${GAUGE_RADIUS} ${GAUGE_RADIUS} 0 0 1 ${GAUGE_CENTER + GAUGE_RADIUS} ${GAUGE_CENTER}`}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={GAUGE_STROKE}
          strokeLinecap="round"
          strokeDasharray={GAUGE_ARC_LENGTH}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
        <text
          x={GAUGE_CENTER}
          y={GAUGE_CENTER - 4}
          textAnchor="middle"
          className="fill-foreground text-[15px] font-semibold"
        >
          {confidence}%
        </text>
      </svg>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export default ConfidenceGauge
