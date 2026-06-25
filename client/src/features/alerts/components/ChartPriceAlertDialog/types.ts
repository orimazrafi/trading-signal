export type ChartPriceAlertDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  symbol: string
  baselinePrice: number
  timeLabel?: string
  userEmail: string
  creating: boolean
  onCreate: (input: {
    thresholdPercent: number
    emailEnabled: boolean
    baselinePrice: number
  }) => Promise<void>
}
