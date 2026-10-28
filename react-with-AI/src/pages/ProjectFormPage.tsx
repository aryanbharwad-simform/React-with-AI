import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { ProjectForm } from '@/components/ProjectForm'
import { ErrorState } from '@/components/states/ErrorState'
import { LoadingState } from '@/components/states/LoadingState'
import { NotFoundState } from '@/components/states/NotFoundState'
import { useFetch } from '@/hooks/useFetch'
import type { ProjectFormValues } from '@/schemas/project'
import { ApiError } from '@/services/apiClient'
import { createProject, getProject, updateProject } from '@/services/projectService'

/** Admin only (wrapped in <AdminRoute>). /projects/new and /projects/:projectId/edit. */
export function ProjectFormPage() {
  const { projectId } = useParams()
  return projectId ? <EditProject id={Number(projectId)} /> : <CreateProject />
}

function CreateProject() {
  const navigate = useNavigate()

  async function handleSubmit(values: ProjectFormValues) {
    await createProject(values)
    navigate('/projects')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New project" />
      <ProjectForm
        defaultValues={{ name: '', description: '' }}
        submitLabel="Create project"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/projects')}
      />
    </div>
  )
}

function EditProject({ id }: { id: number }) {
  const navigate = useNavigate()
  const loadProject = useCallback((signal: AbortSignal) => getProject(id, signal), [id])
  const { state, reload } = useFetch(loadProject)

  async function handleSubmit(values: ProjectFormValues) {
    await updateProject(id, values)
    navigate('/projects')
  }

  if (state.status === 'loading') return <LoadingState label="Loading project…" />
  if (state.status === 'error') {
    if (state.error instanceof ApiError && state.error.isNotFound) {
      return <NotFoundState title="Project not found" message="This project doesn't exist or was deleted." />
    }
    return <ErrorState title="Couldn't load project" error={state.error} onRetry={reload} />
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit project" subtitle={state.data.name} />
      {/* Rendered only after loading, so the form starts with the API values (no reset needed). */}
      <ProjectForm
        defaultValues={{ name: state.data.name, description: state.data.description }}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/projects')}
      />
    </div>
  )
}
