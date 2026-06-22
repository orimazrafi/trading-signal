import { type FormEvent, useState } from 'react'
import type { SearchStockResult } from '../../../types/stock'
import type { SignalAction } from '../../../types/watchlist'
import { buildSignalReason, toSignalAction } from '../../../lib/signalUtils'
import { searchStock } from '../../../api/stocks'

/** Owns symbol search form state and stock lookup with recommendation. */
export function useSearchStock() {
  const [symbolInput, setSymbolInput] = useState('')
  const [searchResult, setSearchResult] = useState<SearchStockResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const searchAction: SignalAction | null = searchResult
    ? toSignalAction(searchResult.recommendation)
    : null

  const searchReason = searchAction ? buildSignalReason(searchAction) : null

  /** Clears the current search result and error state. */
  const clearSearch = () => {
    setSearchResult(null)
    setSearchError(null)
  }

  /** Normalizes symbol input to uppercase as the user types. */
  const handleSymbolInputChange = (value: string) => {
    setSymbolInput(value.toUpperCase())
  }

  /** Runs a stock search and stores the recommendation result. */
  const handleSearch = async (event?: FormEvent) => {
    event?.preventDefault()
    setSearchError(null)

    const symbol = symbolInput.trim()
    if (!symbol) {
      setSearchError('Enter a ticker symbol to search.')
      return
    }

    setIsLoading(true)

    try {
      const result = await searchStock(symbol)
      setSearchResult(result)
      setSymbolInput(result.quote.symbol)
    } catch (err) {
      setSearchResult(null)
      setSearchError(err instanceof Error ? err.message : 'Search failed. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    symbolInput,
    searchResult,
    isLoading,
    searchError,
    searchAction,
    searchReason,
    handleSymbolInputChange,
    handleSearch,
    clearSearch,
  }
}
