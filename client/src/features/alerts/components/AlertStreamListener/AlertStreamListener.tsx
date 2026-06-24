import { useAlertStream } from '@/hooks/useAlertStream'

/** Subscribes to alert SSE events for the signed-in session. */
function AlertStreamListener() {
  useAlertStream(true)
  return null
}

export default AlertStreamListener
