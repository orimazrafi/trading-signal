import { type FormEvent, useState } from 'react'
import type { WatchlistTabsProps } from './types'

/** Horizontal tabs for switching custom dashboard views with a create-view dialog. */
export function WatchlistTabs({
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
                <button
                  key={watchlist.id}
                  type="button"
                  onClick={() => onSelectWatchlist(watchlist.id)}
                  className={[
                    'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
                  ].join(' ')}
                >
                  {watchlist.name}
                  <span className="ml-2 text-xs opacity-80">({watchlist.signals.length})</span>
                </button>
              )
            })
          )}
        </div>

        <button
          type="button"
          onClick={openModal}
          aria-label="Create new watchlist view"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-300 bg-violet-50 text-xl font-semibold text-violet-700 transition hover:border-violet-400 hover:bg-violet-100 dark:border-violet-500/50 dark:bg-violet-950/40 dark:text-violet-200 dark:hover:bg-violet-900/50"
        >
          +
        </button>
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
              <label className="block text-left text-sm font-medium text-slate-700 dark:text-slate-200">
                View name
                <input
                  type="text"
                  value={viewName}
                  onChange={(event) => setViewName(event.target.value)}
                  placeholder="My watchlist"
                  maxLength={80}
                  autoFocus
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-violet-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              {formError ? (
                <p className="text-left text-sm text-red-600 dark:text-red-400">{formError}</p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {creating ? 'Creating…' : 'Create view'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
