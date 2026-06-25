/** Browser install prompt event (Chromium; not in standard DOM lib). */
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

/** Outcome of calling BeforeInstallPromptEvent.prompt(). */
export type PwaInstallOutcome = 'accepted' | 'dismissed' | 'unavailable'
