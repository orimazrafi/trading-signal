import {
  ALERT_MAX_THRESHOLD_PERCENT,
  ALERT_MIN_THRESHOLD_PERCENT,
} from '@/types/alert'

export type PriceAlertFormInput = {
  symbolInput: string
  thresholdInput: string
}

export type ParsedPriceAlertForm = {
  symbol: string
  thresholdPercent: number
}

export type PriceAlertFormValidationResult =
  | { ok: true; value: ParsedPriceAlertForm }
  | { ok: false; error: string }

/** Normalizes and validates price alert form inputs. */
export function parsePriceAlertForm(input: PriceAlertFormInput): PriceAlertFormValidationResult {
  const symbol = input.symbolInput.trim().toUpperCase()
  const thresholdPercent = Number(input.thresholdInput)

  if (!symbol) {
    return { ok: false as const, error: 'Enter a stock symbol.' }
  }

  if (
    !Number.isFinite(thresholdPercent) ||
    thresholdPercent < ALERT_MIN_THRESHOLD_PERCENT ||
    thresholdPercent > ALERT_MAX_THRESHOLD_PERCENT
  ) {
    return {
      ok: false as const,
      error: `Enter a threshold between ${ALERT_MIN_THRESHOLD_PERCENT}% and ${ALERT_MAX_THRESHOLD_PERCENT}%.`,
    }
  }

  return { ok: true as const, value: { symbol, thresholdPercent } }
}
