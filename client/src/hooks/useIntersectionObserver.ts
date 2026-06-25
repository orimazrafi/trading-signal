import { useEffect, useState } from 'react'
import type { UseIntersectionObserverOptions, UseIntersectionObserverResult } from './types'

const DEFAULT_ROOT_MARGIN = '120px 0px'

/** Observes when a DOM node enters the viewport via the Intersection Observer API. */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
): UseIntersectionObserverResult {
  const {
    enabled = true,
    root = null,
    rootMargin = DEFAULT_ROOT_MARGIN,
    threshold = 0,
    freezeOnceVisible = true,
  } = options

  const [target, setTarget] = useState<Element | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    if (!enabled || !target) {
      return
    }

    if (freezeOnceVisible && isIntersecting) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { root, rootMargin, threshold },
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [enabled, freezeOnceVisible, isIntersecting, root, rootMargin, target, threshold])

  return {
    ref: setTarget,
    isIntersecting,
  }
}
