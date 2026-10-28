import { Link } from 'react-router'
import { OverdueBadge, PriorityBadge, StatusBadge } from '@/components/ui/Badges'
import { formatDate, isOverdue } from '@/lib/dates'
import type { Task } from '@/types'

interface TaskTableProps {
  tasks: Task[]
  /** The 4th column differs per screen: "Assignee" in a project, "Project" in My tasks. */
  extraColumn: { header: string; value: (task: Task) => string }
}

export function TaskTable({ tasks, extraColumn }: TaskTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">Title</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3">Priority</th>
            <th scope="col" className="px-4 py-3">{extraColumn.header}</th>
            <th scope="col" className="px-4 py-3">Due date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((task) => {
            const overdue = isOverdue(task)
            return (
              // `key` lets React match rows between renders. Use a stable id, never the index.
              <tr key={task.id} className={overdue ? 'bg-red-50/60' : undefined}>
                <td className="px-4 py-3 font-medium">
                  <Link to={`/tasks/${task.id}`} className="text-indigo-700 hover:underline">
                    {task.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-4 py-3 text-slate-600">{extraColumn.value(task)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={overdue ? 'font-medium text-red-700' : 'text-slate-600'}>
                    {formatDate(task.dueDate)}
                  </span>
                  {overdue && (
                    <span className="ml-2">
                      <OverdueBadge />
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
