import { Button } from '@/components/Button'
import type { ToastItemProps, ToastVariant } from './types'

/** Returns Tailwind classes for a toast variant. */
function variantClassName(variant: ToastVariant): string {
  switch (variant) {
    case 'success':
      return 'border-positive/30 bg-positive-muted text-positive'
    case 'error':
      return 'border-destructive/30 bg-destructive/10 text-destructive'
    case 'warning':
      return 'border-warning/30 bg-warning-muted text-warning'
    default:
      return 'border-border bg-card text-card-foreground'
  }
}

/** Renders one dismissible toast message with optional action buttons. */
function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const hasActions = Boolean(toast.actions?.length)

  /** Dismisses this toast when the user clicks the toast body. */
  const handleDismiss = () => {
    onDismiss(toast.id)
  }

  /** Dismisses this toast when Enter or Space is pressed on the body. */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasActions && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onDismiss(toast.id)
    }
  }

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      onKeyDown={handleKeyDown}
      className={`w-full max-w-sm rounded-xl border px-4 py-3 text-left text-sm shadow-lg ${variantClassName(toast.variant)}`}
    >
      {toast.title ? <p className="mb-1 font-semibold">{toast.title}</p> : null}
      <button
        type="button"
        onClick={handleDismiss}
        className={`w-full text-left font-medium ${hasActions ? 'cursor-default' : 'cursor-pointer hover:opacity-90'}`}
      >
        {toast.message}
      </button>

      {hasActions ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {toast.actions?.map((action) => (
            <Button
              key={action.label}
              type="button"
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              onClick={(event) => {
                event.stopPropagation()
                action.onClick(toast.id)
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default ToastItem
