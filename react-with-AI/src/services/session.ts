import { ROLES, type User } from '@/types'

/**
 * Persists the session (token + public user info) so a page refresh keeps you logged in.
 * Never contains the password: the login form sends it to the API and then forgets it.
 */
export interface Session {
  token: string
  user: User
}

const STORAGE_KEY = 'taskflow.session'

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isSession(parsed) ? parsed : null
  } catch {
    // Corrupted JSON or storage blocked (private mode) -> behave as logged out.
    return null
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/** Reads the `exp` claim of a JWT. The signature is checked by the server, not here. */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1]
    const json: unknown = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof json === 'object' && json !== null && 'exp' in json && typeof json.exp === 'number') {
      return json.exp * 1000 <= Date.now()
    }
    return false
  } catch {
    return true
  }
}

// Data from storage is untrusted (anyone can edit it in DevTools), so check its shape.
function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false
  const { token, user } = value as Record<string, unknown>
  if (typeof token !== 'string' || typeof user !== 'object' || user === null) return false
  const u = user as Record<string, unknown>
  return (
    typeof u.id === 'number' &&
    typeof u.name === 'string' &&
    typeof u.email === 'string' &&
    ROLES.includes(u.role as User['role'])
  )
}
