export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number] // 'todo' | 'in_progress' | 'done'

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

/** Human-readable labels for the UI. `Record<TaskStatus, string>` forces a label for every status. */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export interface Task {
  id: number
  projectId: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  /** Tasks may be unassigned. `null` (not `undefined`) because that's what JSON stores. */
  assigneeId: number | null
  /** Calendar date "YYYY-MM-DD" (no time / timezone). */
  dueDate: string
  /** ISO timestamp, set by the app when the task is created. */
  createdAt: string
}

/** Body for creating/updating a task: the server generates `id`. */
export type TaskInput = Omit<Task, 'id'>
