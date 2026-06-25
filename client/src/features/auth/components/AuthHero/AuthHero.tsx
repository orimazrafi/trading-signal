/** Decorative hero panel for the authentication split layout. */
function AuthHero() {
  return (
    <aside
      className="relative hidden overflow-hidden bg-[#071525] text-slate-100 lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:p-12"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.15),transparent_40%)]" />

      <div className="relative z-10">
        <p className="text-sm font-medium tracking-wide text-sky-300/90 uppercase">
          Trading Signal
        </p>
        <h2 className="mt-4 max-w-md text-3xl leading-tight font-medium text-white">
          Clarity for every market move.
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
          Watchlists, live ideas, and price alerts — built for focused decisions, not noise.
        </p>
      </div>

      <div className="relative z-10 mt-10">
        <svg viewBox="0 0 400 120" className="h-28 w-full max-w-md opacity-90" fill="none">
          <defs>
            <linearGradient id="authChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(52,211,153,0.45)" />
              <stop offset="100%" stopColor="rgba(52,211,153,0)" />
            </linearGradient>
          </defs>
          <path
            d="M0 90 L40 72 L80 78 L120 52 L160 58 L200 34 L240 40 L280 22 L320 30 L360 12 L400 18 L400 120 L0 120 Z"
            fill="url(#authChartFill)"
          />
          <path
            d="M0 90 L40 72 L80 78 L120 52 L160 58 L200 34 L240 40 L280 22 L320 30 L360 12 L400 18"
            stroke="#34d399"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-4 max-w-sm text-xs text-slate-400">
          “The stock market is a device for transferring money from the impatient to the patient.”
          — Warren Buffett
        </p>
      </div>
    </aside>
  )
}

export default AuthHero
