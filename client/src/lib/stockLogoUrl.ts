/** Known ticker → company domain mappings for Clearbit logo fallback. */
const SYMBOL_DOMAIN_MAP: Record<string, string> = {
  AAPL: 'apple.com',
  MSFT: 'microsoft.com',
  GOOGL: 'google.com',
  GOOG: 'google.com',
  AMZN: 'amazon.com',
  META: 'meta.com',
  TSLA: 'tesla.com',
  NVDA: 'nvidia.com',
  JPM: 'jpmorganchase.com',
  XOM: 'exxonmobil.com',
}

/** Builds a stock logo image URL for a ticker symbol. */
export function buildStockLogoUrl(symbol: string): string {
  const normalized = symbol.trim().toUpperCase()
  const domain = SYMBOL_DOMAIN_MAP[normalized]

  if (domain) {
    return `https://logo.clearbit.com/${domain}`
  }

  return `https://financialmodelingprep.com/image-stock/${encodeURIComponent(normalized)}.png`
}

/** Returns uppercase initials for a ticker symbol (logo fallback). */
export function stockLogoInitials(symbol: string): string {
  return symbol.trim().toUpperCase().slice(0, 2)
}
