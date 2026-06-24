/** Inline loading spinner for async dashboard actions. */
function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <span
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  )
}

export default LoadingSpinner
