import { TOAST_DEFAULT_DURATION_MS, type Toast, type ToastOptions, type ToastVariant } from './types'

const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>()

let toasts: Toast[] = []
const listeners = new Set<() => void>()

/** Notifies React subscribers that the toast list changed. */
function emit(): void {
  listeners.forEach((listener) => listener())
}

/** Returns the current toast stack snapshot. */
export function getToasts(): Toast[] {
  return toasts
}

/** Subscribes to toast stack updates; returns an unsubscribe function. */
export function subscribeToToasts(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Clears a scheduled auto-dismiss timer for a toast. */
function clearDismissTimer(id: string): void {
  const timer = dismissTimers.get(id)
  if (timer) {
    clearTimeout(timer)
    dismissTimers.delete(id)
  }
}

/** Removes a toast from the stack by id. */
export function dismissToast(id: string): void {
  clearDismissTimer(id)

  const nextToasts = toasts.filter((toast) => toast.id !== id)
  if (nextToasts.length === toasts.length) {
    return
  }

  toasts = nextToasts
  emit()
}

/** Enqueues a toast and schedules auto-dismiss. */
function enqueueToast(variant: ToastVariant, message: string, options: ToastOptions = {}): string {
  const id = crypto.randomUUID()
  const durationMs = options.durationMs ?? TOAST_DEFAULT_DURATION_MS

  toasts = [
    ...toasts,
    {
      id,
      title: options.title,
      message,
      variant,
      durationMs,
      actions: options.actions,
    },
  ]
  emit()

  const timer = setTimeout(() => dismissToast(id), durationMs)
  dismissTimers.set(id, timer)

  return id
}

/** Imperative toast API usable from any module. */
export const toast = {
  success: (message: string, options?: ToastOptions) => enqueueToast('success', message, options),
  error: (message: string, options?: ToastOptions) => enqueueToast('error', message, options),
  info: (message: string, options?: ToastOptions) => enqueueToast('info', message, options),
  warning: (message: string, options?: ToastOptions) => enqueueToast('warning', message, options),
  dismiss: dismissToast,
}
