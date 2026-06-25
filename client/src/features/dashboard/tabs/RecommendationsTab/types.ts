export type RecommendationsTabProps = {
  onAddToWatchlist?: (symbol: string) => Promise<void>
  onRemoveFromWatchlist?: (symbol: string) => Promise<void>
  isSymbolInActiveWatchlist?: (symbol: string) => boolean
  savingSymbol?: string | null
  watchlistName?: string | null
}
