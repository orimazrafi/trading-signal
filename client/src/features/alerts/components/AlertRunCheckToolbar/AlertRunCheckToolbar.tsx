import { Button } from '@/components/Button'
import { ErrorMessage } from '@/components/ErrorMessage'
import { toast } from '@/components/Toast'
import { isAlertRunCheckEnabled } from '@/lib/isAlertRunCheckEnabled'
import type { AlertRunCheckToolbarProps } from './types'

/** Dev-only toolbar to run an immediate check across all enabled alerts. */
function AlertRunCheckToolbar({ running, error, onRunCheck }: AlertRunCheckToolbarProps) {
  if (!isAlertRunCheckEnabled()) {
    return null
  }

  /** Runs a global alert check for every enabled alert. */
  const handleRunCheck = async () => {
    try {
      await onRunCheck()
      toast.success('Checked all enabled alerts. The 5-minute schedule is unchanged.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to run alert check.')
    }
  }

  return (
    <section className="rounded-xl border border-border bg-muted/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Run alert check</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Dev only: evaluates every enabled alert now. Not tied to the symbol form below.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={running}
          loading={running}
          loadingLabel="Checking…"
          onClick={() => void handleRunCheck()}
        >
          Run check now
        </Button>
      </div>
      {error ? <ErrorMessage message={error} className="mt-3" /> : null}
    </section>
  )
}

export default AlertRunCheckToolbar
