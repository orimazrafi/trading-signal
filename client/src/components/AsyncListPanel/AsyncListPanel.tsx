import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Panel } from '@/components/Panel'
import type { AsyncListPanelProps } from './types'

/** Renders a titled panel with loading, error, empty, and list states. */
function AsyncListPanel<TItem>({
  title,
  description,
  items,
  isLoading,
  error,
  emptyMessage,
  loadingLabel,
  variant = 'page',
  className = '',
  getItemKey,
  renderItem,
}: AsyncListPanelProps<TItem>) {
  const hasItems = !isLoading && !error && items.length > 0
  const isEmpty = !isLoading && !error && items.length === 0

  return (
    <Panel title={title} description={description} variant={variant} className={className}>
      {isLoading ? <LoadingSpinner label={loadingLabel} /> : null}
      {error ? <ErrorMessage message={error} /> : null}
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
