import { readSession } from './session'

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

/** Every failed request becomes an ApiError, so the UI can show a message and decide what to do. */
export class ApiError extends Error {
  /** HTTP status code, or 0 when the server could not be reached at all. */
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }

  get isNotFound(): boolean {
    return this.status === 404
  }
}

export const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.'

// The API layer must not import React. Instead, AuthProvider registers a callback here
// and we call it when the server rejects our token.
let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

async function request<T>(path: string, { method = 'GET', body, signal }: RequestOptions = {}): Promise<T> {
  const token = readSession()?.token
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    // A cancelled request isn't a failure: re-throw so the caller can ignore it.
    if (signal?.aborted) throw error
    throw new ApiError('Cannot reach the server. Check your connection or that the mock API is running.', 0)
  }

  if (response.status === 401 && token) {
    // We sent a token and the server rejected it: expired or tampered with.
    onUnauthorized?.()
    throw new ApiError(SESSION_EXPIRED_MESSAGE, 401)
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

async function readErrorMessage(response: Response): Promise<string> {
  if (response.status === 404) return 'Not found.'
  if (response.status === 403) return 'You do not have permission to do that.'
  try {
    const data: unknown = await response.json()
    if (typeof data === 'string' && data) return data
  } catch {
    // body was empty or not JSON
  }
  return `Request failed (${response.status}).`
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
}
