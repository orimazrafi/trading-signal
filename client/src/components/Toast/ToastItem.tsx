import type { Toast } from './types'

export type ToastItemProps = {
  toast: Toast
  onDismiss: (id: string) => void
}

/** Returns Tailwind classes for a toast variant. */
function variantClassName(variant: Toast['variant']): string {
  switch (variant) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
    case 'error':
      return 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
    default:
      return 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
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
