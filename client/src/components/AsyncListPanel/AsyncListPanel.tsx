import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Panel } from '@/components/Panel'
import type { AsyncListPanelProps } from './types'

/** Renders a titled panel with loading, error, empty, and list states. */
function AsyncListPanel<TItem>({
  title,
  description,
  header,
  items,
  isLoading,
  error,
  emptyMessage,
  loadingLabel,
  variant = 'page',
  className = '',
  onRetry,
  getItemKey,
  renderItem,
}: AsyncListPanelProps<TItem>) {
  const hasItems = !isLoading && !error && items.length > 0
  const isEmpty = !isLoading && !error && items.length === 0

  return (
    <Panel title={title} description={description} variant={variant} className={className}>
      {header ? <div className="mb-5">{header}</div> : null}

      {isLoading ? <LoadingSpinner label={loadingLabel} /> : null}

      {error ? (
        <div className="space-y-3">
          <ErrorMessage message={error} />
          {onRetry ? (
            <Button type="button" variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      ) : null}

      {isEmpty ? <EmptyState message={emptyMessage} /> : null}

      {hasItems ? (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={getItemKey(item)}>{renderItem(item)}</li>
          ))}
        </ul>
      ) : null}
    </Panel>
  )
}

export default AsyncListPanel
