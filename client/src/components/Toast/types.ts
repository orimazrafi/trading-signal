import type { ReactNode } from 'react'

/** Supported toast visual variants. */
export const TOAST_VARIANTS = ['success', 'error', 'info', 'warning'] as const

export type ToastVariant = (typeof TOAST_VARIANTS)[number]

/** Default auto-dismiss duration in milliseconds. */
export const TOAST_DEFAULT_DURATION_MS = 4000

/** One toast notification in the global stack. */
export type Toast = {
  id: string
  message: string
  variant: ToastVariant
  durationMs: number
}

/** Options when enqueueing a toast. */
export type ToastOptions = {
  durationMs?: number
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
