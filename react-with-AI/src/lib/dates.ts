import type { Task } from '@/types'

/** Today as "YYYY-MM-DD" in the user's local timezone (toISOString() would use UTC). */
export function todayISO(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Overdue = due date has passed and the task isn't done. Derived, never stored. */
export function isOverdue(task: Pick<Task, 'dueDate' | 'status'>): boolean {
  return task.status !== 'done' && task.dueDate < todayISO()
}

/** "2026-10-19" -> "19 Oct 2026" (parsed as a local date, so it never shifts a day). */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
