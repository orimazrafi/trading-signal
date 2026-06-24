export type ChartThemeColors = {
  background: string
  text: string
  grid: string
  line: string
  top: string
  bottom: string
}

const CHART_CSS_VARS = {
  background: '--chart-background',
  text: '--chart-text',
  grid: '--chart-grid',
  line: '--chart-line',
  top: '--chart-area-top',
  bottom: '--chart-area-bottom',
} as const

/** Reads chart colors from semantic CSS variables on :root. */
export function resolveChartThemeColors(): ChartThemeColors {
  const styles = getComputedStyle(document.documentElement)

  const read = (variable: string, fallback: string) => {
    const value = styles.getPropertyValue(variable).trim()
    return value || fallback
  }

  return {
    background: read(CHART_CSS_VARS.background, '#ffffff'),
    text: read(CHART_CSS_VARS.text, '#64748b'),
    grid: read(CHART_CSS_VARS.grid, '#e2e8f0'),
    line: read(CHART_CSS_VARS.line, '#7c3aed'),
    top: read(CHART_CSS_VARS.top, 'rgba(124, 58, 237, 0.35)'),
    bottom: read(CHART_CSS_VARS.bottom, 'rgba(124, 58, 237, 0.02)'),
  }
}
