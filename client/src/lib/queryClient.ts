import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { isRequestCancelled } from '@/api/client'
import { toast } from '@/components/Toast'

/** Returns a user-facing message from an unknown query or mutation error. */
function getErrorMessage(error: unknown): string {
  if (isRequestCancelled(error)) {
    return ''
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

/** Shared React Query client with global error toasts. */
export function createAppQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (isRequestCancelled(error) || query.meta?.suppressErrorToast) {
          return
        }

        const message = getErrorMessage(error)
        if (!message) {
          return
        }

        toast.error(message)
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (isRequestCancelled(error) || mutation.meta?.suppressErrorToast) {
          return
        }

        const message = getErrorMessage(error)
        if (!message) {
          return
        }

        toast.error(message)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  })
}
