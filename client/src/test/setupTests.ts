import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { mswServer } from './msw/server'

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  mswServer.resetHandlers()
})

afterAll(() => {
  mswServer.close()
})

type IntersectionObserverCallbackLike = (
  entries: Array<{ isIntersecting: boolean; target: Element }>,
  observer: IntersectionObserver,
) => void

export type MockIntersectionObserverInstance = {
  callback: IntersectionObserverCallbackLike
  observe: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  unobserve: ReturnType<typeof vi.fn>
  trigger: (isIntersecting: boolean, target?: Element) => void
}

const mockObservers: MockIntersectionObserverInstance[] = []

/** Returns all mock IntersectionObserver instances created since the last reset. */
export function getMockIntersectionObservers(): MockIntersectionObserverInstance[] {
  return mockObservers
}

/** Clears tracked observers — call in beforeEach when tests mutate intersection state. */
export function resetMockIntersectionObservers(): void {
  mockObservers.length = 0
}

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin = ''
  readonly thresholds: ReadonlyArray<number> = []

  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
  takeRecords = vi.fn(() => [])

  constructor(private readonly callback: IntersectionObserverCallbackLike) {
    const instance: MockIntersectionObserverInstance = {
      callback,
      observe: this.observe,
      disconnect: this.disconnect,
      unobserve: this.unobserve,
      trigger: (isIntersecting, target = document.createElement('div')) => {
        callback([{ isIntersecting, target }], this)
      },
    }

    mockObservers.push(instance)
  }
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
