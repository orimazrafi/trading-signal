import type { Location } from 'react-router-dom'

type LoginRedirectState = {
  from?: Pick<Location, 'pathname' | 'search' | 'hash'>
}

/** Narrows router location state to the login redirect shape. */
export function readLoginRedirectFrom(state: unknown): LoginRedirectState['from'] {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return undefined
  }

  const from = state.from

  if (typeof from !== 'object' || from === null || !('pathname' in from)) {
    return undefined
  }

  const pathname = from.pathname

  if (typeof pathname !== 'string') {
    return undefined
  }

  const search = 'search' in from && typeof from.search === 'string' ? from.search : ''
  const hash = 'hash' in from && typeof from.hash === 'string' ? from.hash : ''

  return { pathname, search, hash }
}
