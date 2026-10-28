import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { LoadingState } from '@/components/states/LoadingState'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/hooks/useAuth'
import { useFetch } from '@/hooks/useFetch'
import { buttonClasses } from '@/lib/styles'
import { deleteProject, getProjects } from '@/services/projectService'
import type { ProjectWithTasks } from '@/types'

export function ProjectsPage() {
  const { isAdmin } = useAuth()
  const loadProjects = useCallback((signal: AbortSignal) => getProjects(signal), [])
  const { state, reload } = useFetch(loadProjects)

  // Local UI state: only this screen cares which project is being deleted.
  const [toDelete, setToDelete] = useState<ProjectWithTasks | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function confirmDelete() {
    if (!toDelete) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteProject(toDelete.id)
      setToDelete(null)
      reload() // refetch so the list matches the server
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Could not delete the project.')
    } finally {
      setIsDeleting(false)
    }
  }

  const newProjectLink = (
    <Link to="/projects/new" className={buttonClasses()}>
      New project
    </Link>
  )

  return (
    <>
      <PageHeader title="Projects" subtitle="Everything your team is working on." actions={isAdmin && newProjectLink} />

      {state.status === 'loading' && <LoadingState label="Loading projects…" />}
      {state.status === 'error' && (
        <ErrorState title="Couldn't load projects" error={state.error} onRetry={reload} />
      )}
      {state.status === 'success' && state.data.length === 0 && (
        <EmptyState
          title="No projects yet"
          message={isAdmin ? 'Create the first project to get started.' : 'Ask an admin to create a project.'}
          action={isAdmin && newProjectLink}
        />
      )}
      {state.status === 'success' && state.data.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.data.map((project) => (
            <li key={project.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Link to={`/projects/${project.id}`} className="text-lg font-semibold text-indigo-700 hover:underline">
                {project.name}
              </Link>
              <p className="mt-1 flex-1 text-sm text-slate-600">{project.description || 'No description.'}</p>
              <p className="mt-4 text-sm font-medium text-slate-500">
                {/* Derived from the data, never stored as its own field. */}
                {project.tasks.length} {project.tasks.length === 1 ? 'task' : 'tasks'}
              </p>
              {isAdmin && (
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                  <Link to={`/projects/${project.id}/edit`} className={buttonClasses('secondary')}>
                    Edit
                  </Link>
                  <Button
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => {
                      setDeleteError(null)
                      setToDelete(project)
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete project?"
        message={
          toDelete
            ? `"${toDelete.name}" and its ${toDelete.tasks.length} task(s) will be permanently deleted.`
            : ''
        }
        confirmLabel="Delete project"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
