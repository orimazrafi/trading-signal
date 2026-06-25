import { toast, TOAST_ALERT_DURATION_MS } from '@/components/Toast'

/** Shows an interactive toast when a price alert fires on the SSE stream. */
export function showAlertTriggeredToast(
  symbol: string,
  changePercent: number,
  price: number,
  onViewStock: (symbol: string) => void,
): void {
  const direction = changePercent >= 0 ? 'up' : 'down'
  const formattedChange = Math.abs(changePercent).toFixed(2)

  toast.warning(
    `${symbol} moved ${direction} ${formattedChange}% to $${price.toFixed(2)}.`,
    {
      title: 'Price alert triggered',
      durationMs: TOAST_ALERT_DURATION_MS,
      actions: [
        {
          label: 'View Stock',
          onClick: (toastId) => {
            toast.dismiss(toastId)
            onViewStock(symbol)
          },
        },
        {
          label: 'Dismiss',
          onClick: (toastId) => {
            toast.dismiss(toastId)
          },
        },
      ],
    },
  )
}
