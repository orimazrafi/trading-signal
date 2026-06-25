import { type FormEvent, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/api/client'
import { searchStock } from '@/api/stocks'
import type { SearchStockResult } from '@/types/stock'
import type { SignalAction } from '@/types/watchlist'
import { buildSignalReason, toSignalAction } from '@/lib/signalUtils'
import { queryErrorHandledMeta } from '@/lib/queryMeta'

const EMPTY_SYMBOL_MESSAGE = 'Enter a ticker symbol to search.'

/** Owns symbol search form state and stock lookup with recommendation. */
export function useSearchStock() {
  const [symbolInput, setSymbolInput] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const searchMutation = useMutation({
    mutationFn: (symbol: string) => searchStock(symbol),
    meta: queryErrorHandledMeta,
  })

  const searchResult: SearchStockResult | null = searchMutation.data ?? null

  const searchAction: SignalAction | null = searchResult
    ? toSignalAction(searchResult.recommendation)
    : null

  const searchReason = searchAction ? buildSignalReason(searchAction) : null

  const searchError =
    validationError ??
    (searchMutation.error == null ? null : getApiErrorMessage(searchMutation.error))

  /** Clears the current search result and error state. */
  const clearSearch = () => {
    searchMutation.reset()
    setValidationError(null)
    setSymbolInput('')
  }

  /** Normalizes symbol input to uppercase as the user types. */
  const handleSymbolInputChange = (value: string) => {
    setValidationError(null)
    setSymbolInput(value.toUpperCase())
  }

  /** Runs a stock search and stores the recommendation result. */
  const handleSearch = async (event?: FormEvent) => {
    event?.preventDefault()

    const symbol = symbolInput.trim()
    if (!symbol) {
      setValidationError(EMPTY_SYMBOL_MESSAGE)
      searchMutation.reset()
      return
    }

    setValidationError(null)

    try {
      const result = await searchMutation.mutateAsync(symbol)
      setSymbolInput(result.quote.symbol)
    } catch {
      // Mutation error is exposed via searchError.
    }
  }

  return {
    symbolInput,
    searchResult,
    isLoading: searchMutation.isPending,
    searchError,
    searchAction,
    searchReason,
    handleSymbolInputChange,
    handleSearch,
    clearSearch,
    retrySearch: () => void handleSearch(),
  }
}
