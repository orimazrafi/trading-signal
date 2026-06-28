import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  getMockIntersectionObservers,
  resetMockIntersectionObservers,
} from '@/test/setupTests'
import { useIntersectionObserver } from './useIntersectionObserver'

function VisibilityProbe() {
  const { ref, isIntersecting } = useIntersectionObserver()

  return (
    <div>
      <div ref={ref} aria-label="observer target">
        card
      </div>
      <output aria-label="visibility">{String(isIntersecting)}</output>
    </div>
  )
}

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    resetMockIntersectionObservers()
  })

  afterEach(() => {
    cleanup()
    resetMockIntersectionObservers()
  })

  it('starts hidden and updates when the target intersects', async () => {
    render(<VisibilityProbe />)

    expect(screen.getByLabelText('visibility').textContent).toBe('false')

    const observer = getMockIntersectionObservers()[0]
    expect(observer).toBeDefined()
    observer.trigger(true, screen.getByLabelText('observer target'))

    await waitFor(() => {
      expect(screen.getByLabelText('visibility').textContent).toBe('true')
    })
  })

  it('freezes visibility after the first intersection when configured', async () => {
    function FrozenProbe() {
      const { ref, isIntersecting } = useIntersectionObserver({ freezeOnceVisible: true })

      return (
        <div>
          <div ref={ref} aria-label="observer target" />
          <output aria-label="visibility">{String(isIntersecting)}</output>
        </div>
      )
    }

    render(<FrozenProbe />)
    const observer = getMockIntersectionObservers()[0]

    observer.trigger(true, screen.getByLabelText('observer target'))
    await waitFor(() => {
      expect(screen.getByLabelText('visibility').textContent).toBe('true')
    })

    observer.trigger(false, screen.getByLabelText('observer target'))
    expect(screen.getByLabelText('visibility').textContent).toBe('true')
  })
})
