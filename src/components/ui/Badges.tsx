import { PRIORITY_LABELS, STATUS_LABELS, type TaskPriority, type TaskStatus } from '@/types'

const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap'

const statusColors: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-amber-100 text-amber-800',
  done: 'bg-emerald-100 text-emerald-800',
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-sky-50 text-sky-700',
  medium: 'bg-violet-50 text-violet-700',
  high: 'bg-rose-50 text-rose-700',
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`${base} ${statusColors[status]}`}>{STATUS_LABELS[status]}</span>
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <span className={`${base} ${priorityColors[priority]}`}>{PRIORITY_LABELS[priority]}</span>
}

export function OverdueBadge() {
  return <span className={`${base} bg-red-600 text-white`}>Overdue</span>
}
