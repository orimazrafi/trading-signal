/** Shared Tailwind class strings for recurring layout surfaces. */

export const PANEL_SHELL_CLASS =
  'flex flex-col rounded-2xl border border-border bg-card text-card-foreground shadow-sm'

export const CARD_BASE_CLASS = 'rounded-xl border p-4 text-left shadow-sm'

/** Sticky primary dashboard tab nav — sticks to the viewport top while scrolling. */
export const DASHBOARD_STICKY_NAV_SHELL_CLASS =
  'sticky top-0 z-30 -mx-4 border-b border-border/60 bg-background/95 px-4 py-2 backdrop-blur-md supports-backdrop-filter:bg-background/85'

/** Sticky secondary dashboard bar below the primary nav (watchlist views, market ideas filters). */
export const DASHBOARD_STICKY_SUBBAR_SHELL_CLASS =
  'sticky top-14 z-20 -mx-4 border-b border-border/60 bg-background/95 px-4 py-2 backdrop-blur-md supports-backdrop-filter:bg-background/85'
