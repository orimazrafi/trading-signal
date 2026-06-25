import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { applyThemeMode, readStoredThemeMode, writeStoredThemeMode } from './themeStorage'
import type { ThemeMode } from './types'

type ThemeContextValue = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  resolvedDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

type ThemeProviderProps = {
  children: ReactNode
}

/** Provides theme mode state and applies CSS variables on the document root. */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredThemeMode())
  const [resolvedDark, setResolvedDark] = useState(false)

  /** Updates theme mode in state, storage, and on the document root. */
  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode)
    writeStoredThemeMode(nextMode)
    applyThemeMode(nextMode)
  }

  useEffect(() => {
    applyThemeMode(mode)

    const media = window.matchMedia('(prefers-color-scheme: dark)')

    /** Syncs resolved dark state when system preference or mode changes. */
    const syncResolved = () => {
      const isDark =
        mode === 'dark' || (mode === 'system' && media.matches)
      setResolvedDark(isDark)
      applyThemeMode(mode)
    }

    syncResolved()
    media.addEventListener('change', syncResolved)

    return () => {
      media.removeEventListener('change', syncResolved)
    }
  }, [mode])

  return (
    <ThemeContext.Provider value={{ mode, setMode, resolvedDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

/** Reads theme mode from the nearest ThemeProvider. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
