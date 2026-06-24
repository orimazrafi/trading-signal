export type RecommendationsTabProps = {
  onAddToWatchlist?: (symbol: string) => Promise<void>
  savingSymbol?: string | null
  watchlistName?: string | null
}
