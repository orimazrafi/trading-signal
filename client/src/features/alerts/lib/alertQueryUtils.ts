import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/api/client'

/** Returns the first API error message from a list of query/mutation errors. */
export function getFirstApiErrorMessage(errors: readonly unknown[]): string | null {
  const firstError = errors.find((error) => error != null)
  return firstError == null ? null : getApiErrorMessage(firstError)
}

/** Invalidates cached queries for a key. */
export async function invalidateQueryKey(
  queryClient: QueryClient,
  queryKey: QueryKey,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey })
}

/** Runs a mutation and invalidates the related query cache on success. */
export async function runMutationAndInvalidate<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  mutate: () => Promise<T>,
): Promise<T> {
  const result = await mutate()
  await invalidateQueryKey(queryClient, queryKey)
  return result
}
