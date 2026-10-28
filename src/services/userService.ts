import type { User } from '@/types'
import { api } from './apiClient'

/**
 * json-server returns every field, including the password hash. Copy only the public fields
 * so the hash never reaches React state.
 */
export function toUser(raw: User): User {
  return { id: raw.id, name: raw.name, email: raw.email, role: raw.role }
}

export async function getUsers(signal?: AbortSignal): Promise<User[]> {
  const users = await api.get<User[]>('/users?_sort=name', signal)
  return users.map(toUser)
}
