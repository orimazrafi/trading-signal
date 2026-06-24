export type StockSearchProps = {
  activeWatchlistId: string | null
  activeWatchlistName?: string
  saving: boolean
  onSave: (symbol: string) => Promise<void>
}
