import { type FormEvent, useState } from 'react'
import { Button } from '@/components/Button'
import { CheckboxField } from '@/components/CheckboxField'
import { FormField } from '@/components/FormField'
import { toast } from '@/components/Toast'
import { ALERT_MAX_THRESHOLD_PERCENT, ALERT_MIN_THRESHOLD_PERCENT } from '@/types/alert'
import { parsePriceAlertForm } from '@/features/alerts/lib/priceAlertFormUtils'
import type { PriceAlertCreateFormProps } from './types'

/** Form for adding a new price alert with symbol, threshold, and email options. */
function PriceAlertCreateForm({ userEmail, creating, onCreate }: PriceAlertCreateFormProps) {
  const [symbolInput, setSymbolInput] = useState('')
  const [thresholdInput, setThresholdInput] = useState('3')
  const [emailEnabled, setEmailEnabled] = useState(true)

  /** Creates a new alert from the form inputs. */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const parsed = parsePriceAlertForm({ symbolInput, thresholdInput })
    if (parsed.ok === false) {
      toast.error(parsed.error)
      return
    }

    try {
      await onCreate(parsed.value.symbol, parsed.value.thresholdPercent, emailEnabled)
      setSymbolInput('')
      setEmailEnabled(true)
      toast.success(`${parsed.value.symbol} alert saved.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to create alert.')
    }
  }

  return (
    <form className="mb-5 space-y-3" onSubmit={(event) => void handleSubmit(event)}>
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_8rem_auto]">
        <FormField
          label="Symbol"
          value={symbolInput}
          onChange={setSymbolInput}
          placeholder="AAPL"
        />

        <FormField
          label="Threshold %"
          type="number"
          min={ALERT_MIN_THRESHOLD_PERCENT}
          max={ALERT_MAX_THRESHOLD_PERCENT}
          step="0.1"
          value={thresholdInput}
          onChange={setThresholdInput}
        />

        <Button type="submit" loading={creating} loadingLabel="Adding…">
          Add alert
        </Button>
      </div>

      <CheckboxField
        label="Email me when this alert triggers"
        checked={emailEnabled}
        onChange={setEmailEnabled}
      />

      {emailEnabled ? (
        <p className="text-xs text-muted-foreground">Sent to your account email: {userEmail}</p>
      ) : null}
    </form>
  )
}

export default PriceAlertCreateForm
