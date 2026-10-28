import { saveSession } from '@/services/session'
import type { Project, Task, User } from '@/types'

export const admin: User = { id: 1, name: 'Aisha Admin', email: 'admin@taskflow.dev', role: 'admin' }
export const member: User = { id: 2, name: 'Mohan Member', email: 'mohan@taskflow.dev', role: 'member' }

export const project: Project = { id: 1, name: 'Website Redesign', description: 'New site' }

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    projectId: 1,
    title: 'Write homepage copy',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigneeId: 2,
    dueDate: '2999-01-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

/** A JWT-shaped token that expires in an hour (the app only reads `exp`). */
function fakeToken(): string {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))
  return `header.${payload}.signature`
}

export function logInAs(user: User) {
  saveSession({ token: fakeToken(), user })
}
