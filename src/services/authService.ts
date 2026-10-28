import type { LoginValues } from '@/schemas/auth'
import type { AuthResponse } from '@/types'
import { api, ApiError } from './apiClient'
import { toUser } from './userService'

/** Same message for "unknown email" and "wrong password", so we don't reveal which emails exist. */
export const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.'

export async function login(credentials: LoginValues): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>('/login', credentials)
    return { accessToken: response.accessToken, user: toUser(response.user) }
  } catch (error) {
    // json-server-auth answers 400 with "Incorrect password" / "Cannot find user"
    if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
      throw new ApiError(INVALID_CREDENTIALS_MESSAGE, error.status)
    }
    throw error
  }
}
