import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { CheckboxField } from '@/components/CheckboxField'
import { FormField } from '@/components/FormField'
import { toast } from '@/components/Toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { parsePriceAlertForm } from '@/features/alerts/lib/priceAlertFormUtils'
import { ALERT_MAX_THRESHOLD_PERCENT, ALERT_MIN_THRESHOLD_PERCENT } from '@/types/alert'
import type { ChartPriceAlertDialogProps } from './types'

/** Confirms a chart-selected baseline price before creating a price alert. */
function ChartPriceAlertDialog({
  open,
  onOpenChange,
  symbol,
  baselinePrice,
  timeLabel,
  userEmail,
  creating,
  onCreate,
}: ChartPriceAlertDialogProps) {
  const [thresholdInput, setThresholdInput] = useState('3')
  const [emailEnabled, setEmailEnabled] = useState(true)

  useEffect(() => {
    if (!open) {
      return
    }

    setThresholdInput('3')
    setEmailEnabled(true)
  }, [open, baselinePrice, symbol])

  /** Creates an alert using the chart-selected baseline price. */
  const handleCreate = async () => {
    const parsed = parsePriceAlertForm({ symbolInput: symbol, thresholdInput })

    if (parsed.ok === false) {
      toast.error(parsed.error)
      return
    }

    try {
      await onCreate({
        thresholdPercent: parsed.value.thresholdPercent,
        emailEnabled,
        baselinePrice,
      })
      onOpenChange(false)
      toast.success(`${symbol} alert saved at $${baselinePrice.toFixed(2)}.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to create alert.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!creating} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add price alert for {symbol}</DialogTitle>
          <DialogDescription>
            Alert when price moves ±threshold from the level you clicked on the chart.
            {timeLabel ? ` Selected bar: ${timeLabel}.` : null}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Baseline price</dt>
            <dd className="font-semibold text-foreground">${baselinePrice.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Symbol</dt>
            <dd className="font-semibold text-foreground">{symbol}</dd>
          </div>
        </dl>

        <FormField
          label="Threshold %"
          type="number"
          min={ALERT_MIN_THRESHOLD_PERCENT}
          max={ALERT_MAX_THRESHOLD_PERCENT}
          step="0.1"
          value={thresholdInput}
          onChange={setThresholdInput}
        />

        <CheckboxField
          label="Email me when this alert triggers"
          checked={emailEnabled}
          onChange={setEmailEnabled}
        />

        {emailEnabled ? (
          <p className="text-xs text-muted-foreground">Sent to your account email: {userEmail}</p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            disabled={creating}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            loading={creating}
            loadingLabel="Adding…"
            onClick={() => void handleCreate()}
          >
            Add alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ChartPriceAlertDialog
