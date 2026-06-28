import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { ThemeMode } from './types'
import { applyThemeMode, readStoredThemeMode, writeStoredThemeMode } from './themeStorage'

type ThemeContextValue = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  resolvedDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

type ThemeProviderProps = {
  children: ReactNode
}

/** Resolves whether the active theme should render as dark. */
function resolveIsDark(mode: ThemeMode, prefersDark: boolean): boolean {
  if (mode === 'dark') {
    return true
  }

  if (mode === 'light') {
    return false
  }

  return prefersDark
}

/** Provides theme mode state and applies CSS variables on the document root. */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredThemeMode())
  const [resolvedDark, setResolvedDark] = useState(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return resolveIsDark(readStoredThemeMode(), prefersDark)
  })

  /** Updates theme mode in state, storage, and on the document root. */
  const setMode = (nextMode: ThemeMode) => {
    applyThemeMode(nextMode)
    writeStoredThemeMode(nextMode)

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setResolvedDark(resolveIsDark(nextMode, prefersDark))
    setModeState(nextMode)
  }

  useEffect(() => {
    applyThemeMode(mode)

    const media = window.matchMedia('(prefers-color-scheme: dark)')

    /** Syncs resolved dark state when system preference or mode changes. */
    const syncResolved = () => {
      setResolvedDark(resolveIsDark(mode, media.matches))
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
