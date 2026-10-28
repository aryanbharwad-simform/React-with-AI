import type { Task } from './task'

export interface Project {
  id: number
  name: string
  description: string
}

/** GET /projects?_embed=tasks — json-server nests each project's tasks. */
export interface ProjectWithTasks extends Project {
  tasks: Task[]
}

/** Body for creating/updating a project: everything except the server-generated id. */
export type ProjectInput = Omit<Project, 'id'>
