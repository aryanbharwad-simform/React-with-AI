import type { Project, ProjectInput, ProjectWithTasks } from '@/types'
import { api } from './apiClient'

/** `_embed=tasks` makes json-server include each project's tasks, so we can show the count. */
export function getProjects(signal?: AbortSignal): Promise<ProjectWithTasks[]> {
  return api.get<ProjectWithTasks[]>('/projects?_embed=tasks&_sort=name', signal)
}

export function getProject(id: number, signal?: AbortSignal): Promise<Project> {
  return api.get<Project>(`/projects/${id}`, signal)
}

export function createProject(input: ProjectInput): Promise<Project> {
  return api.post<Project>('/projects', input)
}

export function updateProject(id: number, input: ProjectInput): Promise<Project> {
  return api.patch<Project>(`/projects/${id}`, input)
}

/** json-server also deletes the project's tasks (records whose `projectId` points to it). */
export function deleteProject(id: number): Promise<void> {
  return api.delete(`/projects/${id}`)
}
