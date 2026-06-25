import type { ReactNode } from 'react'

/** Supported toast visual variants. */
export const TOAST_VARIANTS = ['success', 'error', 'info', 'warning'] as const

export type ToastVariant = (typeof TOAST_VARIANTS)[number]

/** Default auto-dismiss duration in milliseconds. */
export const TOAST_DEFAULT_DURATION_MS = 4000

/** Longer duration for interactive alert toasts with action buttons. */
export const TOAST_ALERT_DURATION_MS = 10_000

/** One actionable button on a toast notification. */
export type ToastAction = {
  label: string
  onClick: (toastId: string) => void
}

/** One toast notification in the global stack. */
export type Toast = {
  id: string
  title?: string
  message: string
  variant: ToastVariant
  durationMs: number
  actions?: ToastAction[]
}

/** Options when enqueueing a toast. */
export type ToastOptions = {
  durationMs?: number
  title?: string
  actions?: ToastAction[]
}

export type ToastContainerProps = {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export type ToastItemProps = {
  toast: Toast
  onDismiss: (id: string) => void
}

export type ToastProviderProps = {
  children: ReactNode
}
