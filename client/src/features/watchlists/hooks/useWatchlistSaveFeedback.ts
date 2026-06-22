import { useState } from 'react'
import type { UseWatchlistSaveFeedbackOptions } from '../types'

/** Wraps watchlist save actions with success and error feedback messages. */
export function useWatchlistSaveFeedback({
  watchlistId,
  watchlistName,
  onSave,
}: UseWatchlistSaveFeedbackOptions) {
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  /** Clears save feedback messages. */
  const clearSaveFeedback = () => {
    setSaveError(null)
    setSaveSuccess(null)
  }

  /** Saves a symbol to the active watchlist and surfaces UI feedback. */
  const saveSymbol = async (symbol: string) => {
    if (!watchlistId) {
      setSaveError('Select a custom view before saving a stock.')
      return
    }

    clearSaveFeedback()

    try {
      await onSave(symbol)
      setSaveSuccess(`${symbol} added to ${watchlistName ?? 'your view'}.`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unable to save stock to this view.')
    }
  }

  return {
    saveError,
    saveSuccess,
    saveSymbol,
    clearSaveFeedback,
  }
}
