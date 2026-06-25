export type AlertRunCheckToolbarProps = {
  running: boolean
  error: string | null
  onRunCheck: () => Promise<void>
}
