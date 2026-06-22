import { useEffect, useState } from 'react'

/** Tracks the OS/browser dark mode preference for chart theming. */
export function usePrefersDarkMode(): boolean {
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => setIsDarkMode(media.matches)

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  return isDarkMode
}
