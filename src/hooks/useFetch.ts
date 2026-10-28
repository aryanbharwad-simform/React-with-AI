import { useEffect, useState } from 'react'

export type FetchState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T }

export type Fetcher<T> = (signal: AbortSignal) => Promise<T>

interface Result<T> {
  fetcher: Fetcher<T>
  attempt: number
  state: FetchState<T>
}

/**
 * Loads data when the component mounts and whenever `fetcher` changes.
 *
 * `fetcher` must be stable between renders (wrap it in useCallback with its real inputs as
 * dependencies). A new fetcher = new inputs (e.g. another task id) = a new request.
 */
export function useFetch<T>(fetcher: Fetcher<T>) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result<T> | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetcher(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ fetcher, attempt, state: { status: 'success', data } })
      },
      (error: unknown) => {
        if (controller.signal.aborted) return // cancelled on purpose; not an error
        const err = error instanceof Error ? error : new Error('Something went wrong.')
        setResult({ fetcher, attempt, state: { status: 'error', error: err } })
      },
    )

    // Cleanup: runs before the next request and on unmount. Aborting means a slow, outdated
    // response can never overwrite newer data or update a screen the user already left.
    return () => controller.abort()
  }, [fetcher, attempt])

  // Loading is *derived*: if the stored result belongs to an older fetcher/attempt, we are loading.
  const isCurrent = result !== null && result.fetcher === fetcher && result.attempt === attempt
  const state: FetchState<T> = isCurrent ? result.state : { status: 'loading' }

  return {
    state,
    /** Run the request again (the "Retry" button, or after a change). */
    reload: () => setAttempt((n) => n + 1),
    /** Replace the data locally with what the server returned after a mutation. */
    setData: (data: T) => setResult({ fetcher, attempt, state: { status: 'success', data } }),
  }
}
