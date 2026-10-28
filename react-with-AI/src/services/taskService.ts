import type { Task, TaskInput } from '@/types'
import { api } from './apiClient'

interface TaskQuery {
  projectId?: number
  assigneeId?: number
}

export function getTasks(query: TaskQuery, signal?: AbortSignal): Promise<Task[]> {
  const params = new URLSearchParams({ _sort: 'dueDate' })
  if (query.projectId !== undefined) params.set('projectId', String(query.projectId))
  if (query.assigneeId !== undefined) params.set('assigneeId', String(query.assigneeId))
  return api.get<Task[]>(`/tasks?${params}`, signal)
}

export function getTask(id: number, signal?: AbortSignal): Promise<Task> {
  return api.get<Task>(`/tasks/${id}`, signal)
}

export function createTask(input: TaskInput): Promise<Task> {
  return api.post<Task>('/tasks', input)
}

/** PATCH sends only the fields that change, e.g. `{ status: 'done' }`. */
export function updateTask(id: number, changes: Partial<TaskInput>): Promise<Task> {
  return api.patch<Task>(`/tasks/${id}`, changes)
}
