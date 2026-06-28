import { type FormEvent, useState } from 'react'
import { Button } from '@/components/Button'
import { ErrorMessage } from '@/components/ErrorMessage'
import { FormField } from '@/components/FormField'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DASHBOARD_STICKY_SUBBAR_SHELL_CLASS } from '@/lib/surfaceClasses'
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

  const handleOpenChange = (open: boolean) => {
    if (open) {
      openModal()
      return
    }

    closeModal()
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
      <div className={DASHBOARD_STICKY_SUBBAR_SHELL_CLASS}>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {watchlists.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
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
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md" showCloseButton={!creating}>
          <DialogHeader>
            <DialogTitle>Create custom view</DialogTitle>
            <DialogDescription>
              Name your layout (e.g. Tech Stocks, Dividends).
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              label="View name"
              value={viewName}
              onChange={setViewName}
              placeholder="My watchlist"
            />

            {formError ? <ErrorMessage message={formError} /> : null}

            <DialogFooter className="border-0 bg-transparent p-0 sm:justify-end">
              <Button type="button" variant="secondary" disabled={creating} onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" loading={creating} loadingLabel="Creating…">
                Create view
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default WatchlistTabs
