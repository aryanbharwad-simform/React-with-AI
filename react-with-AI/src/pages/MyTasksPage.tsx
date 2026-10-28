import { useCallback } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { TaskTable } from '@/components/TaskTable'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { LoadingState } from '@/components/states/LoadingState'
import { useAuth } from '@/hooks/useAuth'
import { useFetch } from '@/hooks/useFetch'
import { isOverdue } from '@/lib/dates'
import { getProjects } from '@/services/projectService'
import { getTasks } from '@/services/taskService'
import { STATUS_LABELS, TASK_STATUSES } from '@/types'

export function MyTasksPage() {
  // Read the logged-in user from Context: no prop drilling needed.
  const { user } = useAuth()
  const userId = user?.id

  const loader = useCallback(
    async (signal: AbortSignal) => {
      const [tasks, projects] = await Promise.all([getTasks({ assigneeId: userId }, signal), getProjects(signal)])
      return { tasks, projects }
    },
    [userId],
  )
  const { state, reload } = useFetch(loader)

  if (state.status === 'loading') return <LoadingState label="Loading your tasks…" />
  if (state.status === 'error') return <ErrorState title="Couldn't load your tasks" error={state.error} onRetry={reload} />

  const { tasks, projects } = state.data
  const projectNames = new Map(projects.map((project) => [project.id, project.name]))
  const overdueCount = tasks.filter(isOverdue).length

  return (
    <>
      <PageHeader
        title="My tasks"
        subtitle={`${tasks.length} assigned to you${overdueCount ? ` · ${overdueCount} overdue` : ''}`}
      />

      {tasks.length === 0 ? (
        <EmptyState title="Nothing assigned to you" message="Tasks assigned to you in any project show up here." />
      ) : (
        <div className="space-y-8">
          {/* Grouping is derived from the data: one section per status. */}
          {TASK_STATUSES.map((status) => {
            const group = tasks.filter((task) => task.status === status)
            return (
              <section key={status} aria-labelledby={`group-${status}`}>
                <h2 id={`group-${status}`} className="mb-3 text-lg font-semibold">
                  {STATUS_LABELS[status]} <span className="text-sm font-normal text-slate-500">({group.length})</span>
                </h2>
                {group.length === 0 ? (
                  <p className="text-sm text-slate-500">No tasks.</p>
                ) : (
                  <TaskTable
                    tasks={group}
                    extraColumn={{ header: 'Project', value: (task) => projectNames.get(task.projectId) ?? '—' }}
                  />
                )}
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}
