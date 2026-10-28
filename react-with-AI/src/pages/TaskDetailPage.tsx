import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { ErrorState } from '@/components/states/ErrorState'
import { LoadingState } from '@/components/states/LoadingState'
import { NotFoundState } from '@/components/states/NotFoundState'
import { OverdueBadge, PriorityBadge, StatusBadge } from '@/components/ui/Badges'
import { useFetch } from '@/hooks/useFetch'
import { formatDate, isOverdue } from '@/lib/dates'
import { buttonClasses } from '@/lib/styles'
import { ApiError } from '@/services/apiClient'
import { getProject } from '@/services/projectService'
import { getTask, updateTask } from '@/services/taskService'
import { getUsers } from '@/services/userService'
import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from '@/types'

async function loadTaskDetail(taskId: number, signal: AbortSignal) {
  // The task comes first: we need its projectId before we can load the project.
  const task = await getTask(taskId, signal)
  const [project, users] = await Promise.all([getProject(task.projectId, signal), getUsers(signal)])
  return { task, project, users }
}

export function TaskDetailPage() {
  const taskId = Number(useParams().taskId)
  const loader = useCallback((signal: AbortSignal) => loadTaskDetail(taskId, signal), [taskId])
  const { state, reload, setData } = useFetch(loader)
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  if (state.status === 'loading') return <LoadingState label="Loading task…" />
  if (state.status === 'error') {
    if (state.error instanceof ApiError && state.error.isNotFound) {
      return <NotFoundState title="Task not found" message={`There is no task with id "${taskId}".`} />
    }
    return <ErrorState title="Couldn't load task" error={state.error} onRetry={reload} />
  }

  const { task, project, users } = state.data
  const assignee = users.find((user) => user.id === task.assigneeId)

  async function changeStatus(status: TaskStatus) {
    if (status === task.status || isUpdating) return
    setIsUpdating(true)
    setStatusError(null)
    try {
      // Use the server's response as the new truth. Other screens refetch when they mount,
      // so the list shows this change as soon as you go back.
      const updated = await updateTask(task.id, { status })
      setData({ task: updated, project, users })
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Could not update the status.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={task.title}
        subtitle={
          <Link to={`/projects/${project.id}`} className="hover:underline">
            ← {project.name}
          </Link>
        }
        actions={
          <Link to={`/tasks/${task.id}/edit`} className={buttonClasses('secondary')}>
            Edit task
          </Link>
        }
      />

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <fieldset disabled={isUpdating}>
          <legend className="mb-2 text-sm font-medium text-slate-700">Status</legend>
          <div className="inline-flex rounded-md border border-slate-300" role="group">
            {TASK_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                aria-pressed={task.status === status}
                onClick={() => changeStatus(status)}
                className={`px-4 py-2 text-sm font-medium first:rounded-l-md last:rounded-r-md disabled:opacity-60 ${
                  task.status === status ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
          {isUpdating && <span className="ml-3 text-sm text-slate-500">Saving…</span>}
        </fieldset>
        {statusError && (
          <p role="alert" className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {statusError}
          </p>
        )}

        <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={task.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">Priority</dt>
            <dd className="mt-1">
              <PriorityBadge priority={task.priority} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">Assignee</dt>
            <dd className="mt-1 text-sm">{assignee ? assignee.name : 'Unassigned'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">Due date</dt>
            <dd className="mt-1 flex items-center gap-2 text-sm">
              {formatDate(task.dueDate)}
              {isOverdue(task) && <OverdueBadge />}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">Project</dt>
            <dd className="mt-1 text-sm">{project.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">Created</dt>
            <dd className="mt-1 text-sm">{new Date(task.createdAt).toLocaleString()}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase text-slate-500">Description</dt>
            <dd className="mt-1 text-sm whitespace-pre-wrap text-slate-700">
              {task.description || 'No description.'}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
