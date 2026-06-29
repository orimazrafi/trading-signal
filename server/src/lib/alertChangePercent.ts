/** Returns the percentage move from baseline to current price; zero when baseline is non-positive. */
export function calculateAlertChangePercent(baselinePrice: number, currentPrice: number): number {
  if (baselinePrice <= 0) {
    return 0;
  }

  return ((currentPrice - baselinePrice) / baselinePrice) * 100;
}
