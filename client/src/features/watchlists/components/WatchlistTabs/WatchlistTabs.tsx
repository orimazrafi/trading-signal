import { type FormEvent, useState } from 'react'
import { Button } from '@/components/Button'
import { FormField } from '@/components/FormField'
import type { WatchlistTabsProps } from './types'

/** Horizontal tabs for switching custom dashboard views with a create-view dialog. */
function WatchlistTabs({
  watchlists,
  activeWatchlistId,
  onSelectWatchlist,
  onCreateWatchlist,
  creating = false,
}: WatchlistTabsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewName, setViewName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const openModal = () => {
    setViewName('')
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (creating) {
      return
    }

    setIsModalOpen(false)
    setViewName('')
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = viewName.trim()
    if (!trimmedName) {
      setFormError('View name is required.')
      return
    }

    try {
      await onCreateWatchlist(trimmedName)
      setIsModalOpen(false)
      setViewName('')
      setFormError(null)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create view.')
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 dark:border-slate-700">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {watchlists.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
              No custom views yet. Create one to get started.
            </p>
          ) : (
            watchlists.map((watchlist) => {
              const isActive = watchlist.id === activeWatchlistId

              return (
                <Button
                  key={watchlist.id}
                  type="button"
                  variant={isActive ? 'tabActive' : 'tab'}
                  onClick={() => onSelectWatchlist(watchlist.id)}
                >
                  {watchlist.name}
                  <span className="ml-2 text-xs opacity-80">({watchlist.signals.length})</span>
                </Button>
              )
            })
          )}
        </div>

        <Button type="button" variant="primary" onClick={openModal}>
          +
        </Button>
      </div>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="presentation"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-watchlist-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="create-watchlist-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              Create custom view
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Name your layout (e.g. Tech Stocks, Dividends).
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <FormField
                label="View name"
                value={viewName}
                onChange={setViewName}
                placeholder="My watchlist"
              />

              {formError ? (
                <p className="text-left text-sm text-red-600 dark:text-red-400">{formError}</p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" disabled={creating} onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" loading={creating} loadingLabel="Creating…">
                  Create view
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default WatchlistTabs
