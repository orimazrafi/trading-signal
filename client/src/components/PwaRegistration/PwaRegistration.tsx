import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from '@/components/Toast'

/** Registers the service worker and surfaces smooth update prompts via toasts. */
function PwaRegistration() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
  })

  useEffect(() => {
    if (!needRefresh) {
      return
    }

    toast.info('A new version of Trading Signal is ready.', {
      durationMs: 12_000,
      actions: [
        {
          label: 'Update now',
          onClick: (toastId) => {
            toast.dismiss(toastId)
            void updateServiceWorker(true)
            setNeedRefresh(false)
          },
        },
        {
          label: 'Later',
          onClick: (toastId) => {
            toast.dismiss(toastId)
            setNeedRefresh(false)
          },
        },
      ],
    })
  }, [needRefresh, setNeedRefresh, updateServiceWorker])

  return null
}

export default PwaRegistration
