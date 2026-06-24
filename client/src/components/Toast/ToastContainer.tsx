import ToastItem from './ToastItem'
import type { Toast } from './types'

export type ToastContainerProps = {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

/** Fixed stack of toast notifications in the bottom-right corner. */
function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 p-4 sm:bottom-6 sm:right-6"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
