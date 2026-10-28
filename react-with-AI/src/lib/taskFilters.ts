import { TASK_STATUSES, type Task, type TaskStatus } from '@/types'

/** Filters live in the URL (?status=done&assignee=2&q=login): refresh and shared links keep them. */
export interface TaskFilters {
  status: TaskStatus | ''
  /** '' = everyone, 'unassigned', or a user id */
  assignee: string
  q: string
}

export const FILTER_KEYS = ['status', 'assignee', 'q'] as const

/** Read filters from the URL. Anything invalid (someone edited the URL) is treated as "no filter". */
export function readTaskFilters(params: URLSearchParams): TaskFilters {
  const status = params.get('status') ?? ''
  return {
    status: (TASK_STATUSES as readonly string[]).includes(status) ? (status as TaskStatus) : '',
    assignee: params.get('assignee') ?? '',
    q: params.get('q') ?? '',
  }
}

export function hasActiveFilters(filters: TaskFilters): boolean {
  return filters.status !== '' || filters.assignee !== '' || filters.q.trim() !== ''
}

/** The visible list is derived from (all tasks + filters). It's never stored separately. */
export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const query = filters.q.trim().toLowerCase()
  return tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false
    if (filters.assignee === 'unassigned' && task.assigneeId !== null) return false
    if (filters.assignee && filters.assignee !== 'unassigned' && String(task.assigneeId) !== filters.assignee) {
      return false
    }
    if (query && !task.title.toLowerCase().includes(query)) return false
    return true
  })
}
