import { type FormEvent, useEffect, useRef, useState } from 'react'
import { isRequestCancelled } from '@/api/client'
import { searchStock } from '@/api/stocks'
import type { SearchStockResult } from '@/types/stock'
import type { SignalAction } from '@/types/watchlist'
import { buildSignalReason, toSignalAction } from '@/lib/signalUtils'

/** Owns symbol search form state and stock lookup with recommendation. */
export function useSearchStock() {
  const [symbolInput, setSymbolInput] = useState('')
  const [searchResult, setSearchResult] = useState<SearchStockResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)

  const searchAction: SignalAction | null = searchResult
    ? toSignalAction(searchResult.recommendation)
    : null

  const searchReason = searchAction ? buildSignalReason(searchAction) : null

  /** Aborts any in-flight search when the hook unmounts. */
  useEffect(() => {
    return () => {
      searchAbortRef.current?.abort()
    }
  }, [])

  /** Clears the current search result and error state. */
  const clearSearch = () => {
    searchAbortRef.current?.abort()
    searchAbortRef.current = null
    setSearchResult(null)
    setSearchError(null)
    setIsLoading(false)
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

    searchAbortRef.current?.abort()
    const controller = new AbortController()
    searchAbortRef.current = controller
    setIsLoading(true)

    try {
      const result = await searchStock(symbol, { signal: controller.signal })
      if (searchAbortRef.current !== controller) {
        return
      }

      setSearchResult(result)
      setSymbolInput(result.quote.symbol)
    } catch (err) {
      if (isRequestCancelled(err)) {
        return
      }

      setSearchResult(null)
      setSearchError(err instanceof Error ? err.message : 'Search failed. Try again.')
    } finally {
      if (searchAbortRef.current === controller) {
        searchAbortRef.current = null
        setIsLoading(false)
      }
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
