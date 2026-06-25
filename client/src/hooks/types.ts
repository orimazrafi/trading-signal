/** Options for the Intersection Observer viewport hook. */
export type UseIntersectionObserverOptions = {
  enabled?: boolean
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  /** When true, stops observing after the target first becomes visible. */
  freezeOnceVisible?: boolean
}

/** Result of useIntersectionObserver — ref callback plus visibility flag. */
export type UseIntersectionObserverResult = {
  ref: (node: Element | null) => void
  isIntersecting: boolean
}
