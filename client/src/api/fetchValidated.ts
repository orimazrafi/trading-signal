import type { ApiSchema } from '@trading-signal/contracts/zodApi'
import type { AxiosRequestConfig } from 'axios'
import { parseApiResponse } from '@trading-signal/contracts/zodApi'
import { api } from './client'

/** GETs JSON and validates the response body with a Zod schema. */
export async function fetchValidated<T>(
  url: string,
  schema: ApiSchema<T>,
  resource: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await api.get<unknown>(url, config)
  return parseApiResponse(schema, data, resource)
}

/** POSTs JSON and validates the response body with a Zod schema. */
export async function postValidated<T>(
  url: string,
  schema: ApiSchema<T>,
  resource: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await api.post<unknown>(url, body, config)
  return parseApiResponse(schema, data, resource)
}

/** PATCHes JSON and validates the response body with a Zod schema. */
export async function patchValidated<T>(
  url: string,
  schema: ApiSchema<T>,
  resource: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await api.patch<unknown>(url, body, config)
  return parseApiResponse(schema, data, resource)
}
