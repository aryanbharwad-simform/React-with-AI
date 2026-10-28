export const ROLES = ['admin', 'member'] as const
export type Role = (typeof ROLES)[number] // 'admin' | 'member'

/**
 * A user as the app sees it. There is deliberately no `password` field:
 * if the type doesn't have it, no component can accidentally store or show it.
 */
export interface User {
  id: number
  name: string
  email: string
  role: Role
}

/** What POST /login returns. */
export interface AuthResponse {
  accessToken: string
  user: User
}
