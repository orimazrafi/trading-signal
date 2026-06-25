/** Default lookback periods for moving-average overlays. */
export const MOVING_AVERAGE_PERIODS = {
  SMA_SHORT: 20,
  SMA_LONG: 50,
  EMA_FAST: 12,
} as const

/** P/E ratio bands used for fundamental context in worker analysis. */
export const PE_RATIO_THRESHOLDS = {
  BUY_MAX: 25,
  FAIR_MAX: 40,
} as const

/** Fundamental valuation category derived from a P/E ratio. */
export type PeRatioCategory = 'low' | 'fair' | 'high' | 'unknown'

/** Fundamental context ratios computed alongside technical indicators. */
export type FundamentalContext = {
  peRatio: number | null
  category: PeRatioCategory
  buyThreshold: number
  fairThreshold: number
}

/** Full worker output for one OHLCV history series. */
export type MarketDataAnalysis = {
  sma20: number[]
  sma50: number[]
  ema12: number[]
  fundamentalContext: FundamentalContext
}

/** Computes simple moving average values aligned to the input close series. */
export function calculateSma(values: readonly number[], period: number): number[] {
  if (period <= 0 || values.length === 0) {
    return []
  }

  const result: number[] = []

  for (let index = 0; index < values.length; index += 1) {
    if (index + 1 < period) {
      result.push(Number.NaN)
      continue
    }

    let sum = 0
    for (let offset = index - period + 1; offset <= index; offset += 1) {
      sum += values[offset] ?? 0
    }

    result.push(sum / period)
  }

  return result
}

/** Computes exponential moving average values aligned to the input close series. */
export function calculateEma(values: readonly number[], period: number): number[] {
  if (period <= 0 || values.length === 0) {
    return []
  }

  const multiplier = 2 / (period + 1)
  const result: number[] = []
  let previousEma: number | null = null

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]

    if (value === undefined) {
      result.push(Number.NaN)
      continue
    }

    if (index + 1 < period) {
      result.push(Number.NaN)
      continue
    }

    if (previousEma === null) {
      let seedSum = 0
      for (let offset = index - period + 1; offset <= index; offset += 1) {
        seedSum += values[offset] ?? 0
      }
      previousEma = seedSum / period
      result.push(previousEma)
      continue
    }

    previousEma = (value - previousEma) * multiplier + previousEma
    result.push(previousEma)
  }

  return result
}

/** Maps a P/E ratio into a coarse valuation category for UI context. */
export function categorizePeRatio(peRatio: number | undefined): PeRatioCategory {
  if (peRatio === undefined || !Number.isFinite(peRatio) || peRatio <= 0) {
    return 'unknown'
  }

  if (peRatio <= PE_RATIO_THRESHOLDS.BUY_MAX) {
    return 'low'
  }

  if (peRatio <= PE_RATIO_THRESHOLDS.FAIR_MAX) {
    return 'fair'
  }

  return 'high'
}

/** Builds fundamental context ratios from an optional P/E ratio. */
export function buildFundamentalContext(peRatio: number | undefined): FundamentalContext {
  const hasPeRatio = peRatio !== undefined && Number.isFinite(peRatio) && peRatio > 0

  return {
    peRatio: hasPeRatio ? peRatio : null,
    category: categorizePeRatio(peRatio),
    buyThreshold: PE_RATIO_THRESHOLDS.BUY_MAX,
    fairThreshold: PE_RATIO_THRESHOLDS.FAIR_MAX,
  }
}

/** Runs SMA, EMA, and fundamental context calculations for one OHLCV series. */
export function buildMarketDataAnalysis(input: {
  closes: readonly number[]
  peRatio?: number
}): MarketDataAnalysis {
  return {
    sma20: calculateSma(input.closes, MOVING_AVERAGE_PERIODS.SMA_SHORT),
    sma50: calculateSma(input.closes, MOVING_AVERAGE_PERIODS.SMA_LONG),
    ema12: calculateEma(input.closes, MOVING_AVERAGE_PERIODS.EMA_FAST),
    fundamentalContext: buildFundamentalContext(input.peRatio),
  }
}
