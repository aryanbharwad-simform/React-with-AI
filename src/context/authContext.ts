import { createContext } from 'react'
import type { LoginValues } from '@/schemas/auth'
import type { User } from '@/types'

export interface AuthContextValue {
  user: User | null
  isAdmin: boolean
  /** Message shown on the login page, e.g. after the session expired. */
  notice: string | null
  login: (credentials: LoginValues) => Promise<void>
  logout: (notice?: string) => void
}

// `null` default -> useAuth() can detect a missing <AuthProvider> and fail loudly.
export const AuthContext = createContext<AuthContextValue | null>(null)
