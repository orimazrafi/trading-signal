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

/** Renders one dismissible toast message. */
function ToastItem({ toast, onDismiss }: ToastItemProps) {
  /** Dismisses this toast when the user clicks it. */
  const handleClick = () => {
    onDismiss(toast.id)
  }

  /** Dismisses this toast when Enter or Space is pressed. */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onDismiss(toast.id)
    }
  }

  return (
    <button
      type="button"
      role={toast.variant === 'error' ? 'alert' : 'status'}
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`w-full max-w-sm cursor-pointer rounded-xl border px-4 py-3 text-left text-sm font-medium shadow-lg transition hover:opacity-90 ${variantClassName(toast.variant)}`}
    >
      {toast.message}
    </button>
  )
}

export default ToastItem
