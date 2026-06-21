/** Live or cached stock quote from the search API. */
export type StockQuote = {
  symbol: string
  name: string
  price: number
  peRatio: number
  sector: string
}

/** Response from GET /api/stocks/:symbol/search. */
export type SearchStockResult = {
  quote: StockQuote
  recommendation: string
  signalId: string
}
