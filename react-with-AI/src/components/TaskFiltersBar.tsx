import { Button } from '@/components/ui/Button'
import { inputClasses } from '@/lib/styles'
import type { TaskFilters } from '@/lib/taskFilters'
import { STATUS_LABELS, TASK_STATUSES, type User } from '@/types'

interface TaskFiltersBarProps {
  filters: TaskFilters
  users: User[]
  onChange: (key: keyof TaskFilters, value: string) => void
  onClear: () => void
}

/**
 * A "controlled" component: it holds no state. It shows `filters` (from the URL) and reports
 * changes upward. The parent decides where the state lives.
 */
export function TaskFiltersBar({ filters, users, onChange, onClear }: TaskFiltersBarProps) {
  return (
    <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
      <div>
        <label htmlFor="filter-q" className="mb-1 block text-xs font-medium text-slate-500">
          Search
        </label>
        <input
          id="filter-q"
          type="search"
          placeholder="Search by title…"
          value={filters.q}
          onChange={(event) => onChange('q', event.target.value)}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="filter-status" className="mb-1 block text-xs font-medium text-slate-500">
          Status
        </label>
        <select
          id="filter-status"
          value={filters.status}
          onChange={(event) => onChange('status', event.target.value)}
          className={inputClasses}
        >
          <option value="">All statuses</option>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-assignee" className="mb-1 block text-xs font-medium text-slate-500">
          Assignee
        </label>
        <select
          id="filter-assignee"
          value={filters.assignee}
          onChange={(event) => onChange('assignee', event.target.value)}
          className={inputClasses}
        >
          <option value="">Everyone</option>
          <option value="unassigned">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={String(user.id)}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <Button variant="ghost" onClick={onClear}>
        Clear
      </Button>
    </div>
  )
}
