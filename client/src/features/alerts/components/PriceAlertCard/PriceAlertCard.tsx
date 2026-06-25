import { useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { CheckboxField } from '@/components/CheckboxField'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { toast } from '@/components/Toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { PriceAlertCardProps } from './types'

/** Renders one active price alert with toggles and actions. */
function PriceAlertCard({
  alert,
  userEmail,
  updating,
  deleting,
  onToggleEnabled,
  onToggleEmail,
  onDelete,
}: PriceAlertCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  /** Deletes this alert and surfaces feedback. */
  const handleDelete = async () => {
    try {
      await onDelete(alert.id)
      toast.success(`${alert.symbol} alert removed.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to remove alert.')
    }
  }

  return (
    <>
      <Card variant="muted" className="shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{alert.symbol}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Alert when price moves ±{alert.thresholdPercent.toFixed(2)}% from $
              {alert.baselinePrice.toFixed(2)}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="secondary" disabled={deleting}>
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
                Remove alert
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <CheckboxField
            label="Enabled"
            checked={alert.enabled}
            disabled={updating}
            onChange={(checked) => void onToggleEnabled(alert, checked)}
          />

          <CheckboxField
            label={`Email me (${userEmail})`}
            checked={alert.emailEnabled}
            disabled={updating}
            onChange={(checked) => void onToggleEmail(alert, checked)}
          />
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Remove ${alert.symbol} alert?`}
        description="You will stop receiving price notifications for this symbol until you set up a new alert."
        confirmLabel="Remove alert"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default PriceAlertCard
