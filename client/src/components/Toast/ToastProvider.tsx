import { useSyncExternalStore, type ReactNode } from 'react'
import ToastContainer from './ToastContainer'
import { dismissToast, getToasts, subscribeToToasts } from './toastStore'

export type ToastProviderProps = {
  children: ReactNode
}

/** Mounts the global toast stack and exposes the imperative toast API. */
function ToastProvider({ children }: ToastProviderProps) {
  const toasts = useSyncExternalStore(subscribeToToasts, getToasts, getToasts)

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}

export default ToastProvider
