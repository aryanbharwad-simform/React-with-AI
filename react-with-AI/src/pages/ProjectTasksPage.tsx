import { useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { TaskFiltersBar } from '@/components/TaskFiltersBar'
import { TaskTable } from '@/components/TaskTable'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { LoadingState } from '@/components/states/LoadingState'
import { NotFoundState } from '@/components/states/NotFoundState'
import { Button } from '@/components/ui/Button'
import { useFetch } from '@/hooks/useFetch'
import { buttonClasses } from '@/lib/styles'
import { FILTER_KEYS, filterTasks, hasActiveFilters, readTaskFilters, type TaskFilters } from '@/lib/taskFilters'
import { ApiError } from '@/services/apiClient'
import { getProject } from '@/services/projectService'
import { getTasks } from '@/services/taskService'
import { getUsers } from '@/services/userService'

async function loadProjectTasks(projectId: number, signal: AbortSignal) {
  // Three independent requests -> run them in parallel.
  const [project, tasks, users] = await Promise.all([
    getProject(projectId, signal),
    getTasks({ projectId }, signal),
    getUsers(signal),
  ])
  return { project, tasks, users }
}

export function ProjectTasksPage() {
  const projectId = Number(useParams().projectId)
  const loader = useCallback((signal: AbortSignal) => loadProjectTasks(projectId, signal), [projectId])
  const { state, reload } = useFetch(loader)

  // URL state: the single home for filters. No useState copy of them anywhere.
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = readTaskFilters(searchParams)

  function updateFilter(key: keyof TaskFilters, value: string) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      // replace: typing in search shouldn't add a browser history entry per keystroke
      { replace: true },
    )
  }

  function clearFilters() {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        FILTER_KEYS.forEach((key) => next.delete(key))
        return next
      },
      { replace: true },
    )
  }

  if (state.status === 'loading') return <LoadingState label="Loading tasks…" />
  if (state.status === 'error') {
    if (state.error instanceof ApiError && state.error.isNotFound) {
      return <NotFoundState title="Project not found" message="This project doesn't exist or was deleted." />
    }
    return <ErrorState title="Couldn't load tasks" error={state.error} onRetry={reload} />
  }

  const { project, tasks, users } = state.data
  const usersById = new Map(users.map((user) => [user.id, user]))
  const visibleTasks = filterTasks(tasks, filters) // derived on every render, never stored

  const newTaskLink = (
    <Link to={`/projects/${project.id}/tasks/new`} className={buttonClasses()}>
      New task
    </Link>
  )

  return (
    <>
      <PageHeader
        title={project.name}
        subtitle={
          <>
            <Link to="/projects" className="hover:underline">
              Projects
            </Link>{' '}
            / {project.description || 'No description'}
          </>
        }
        actions={newTaskLink}
      />

      {tasks.length === 0 ? (
        <EmptyState title="No tasks yet" message="This project has no tasks." action={newTaskLink} />
      ) : (
        <>
          <TaskFiltersBar filters={filters} users={users} onChange={updateFilter} onClear={clearFilters} />
          <p className="mb-2 text-sm text-slate-500" aria-live="polite">
            Showing {visibleTasks.length} of {tasks.length} tasks
          </p>
          {visibleTasks.length === 0 ? (
            <EmptyState
              title="No tasks match your filters"
              message="Try a different status, assignee or search term."
              action={
                hasActiveFilters(filters) && (
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )
              }
            />
          ) : (
            <TaskTable
              tasks={visibleTasks}
              extraColumn={{
                header: 'Assignee',
                value: (task) =>
                  task.assigneeId === null ? 'Unassigned' : (usersById.get(task.assigneeId)?.name ?? 'Unknown user'),
              }}
            />
          )}
        </>
      )}
    </>
  )
}
