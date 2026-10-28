import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { TaskForm } from '@/components/TaskForm'
import { ErrorState } from '@/components/states/ErrorState'
import { LoadingState } from '@/components/states/LoadingState'
import { NotFoundState } from '@/components/states/NotFoundState'
import { useFetch } from '@/hooks/useFetch'
import { emptyTaskValues, formValuesToTaskInput, taskToFormValues, type TaskFormValues } from '@/schemas/task'
import { ApiError } from '@/services/apiClient'
import { getProject } from '@/services/projectService'
import { createTask, getTask, updateTask } from '@/services/taskService'
import { getUsers } from '@/services/userService'

function isNotFound(error: Error) {
  return error instanceof ApiError && error.isNotFound
}

/** /projects/:projectId/tasks/new */
export function CreateTaskPage() {
  const projectId = Number(useParams().projectId)
  const navigate = useNavigate()
  const loader = useCallback(
    async (signal: AbortSignal) => {
      const [project, users] = await Promise.all([getProject(projectId, signal), getUsers(signal)])
      return { project, users }
    },
    [projectId],
  )
  const { state, reload } = useFetch(loader)

  async function handleSubmit(values: TaskFormValues) {
    const task = await createTask({
      ...formValuesToTaskInput(values),
      projectId,
      createdAt: new Date().toISOString(),
    })
    navigate(`/tasks/${task.id}`)
  }

  if (state.status === 'loading') return <LoadingState />
  if (state.status === 'error') {
    if (isNotFound(state.error)) return <NotFoundState title="Project not found" />
    return <ErrorState error={state.error} onRetry={reload} />
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New task" subtitle={`in ${state.data.project.name}`} />
      <TaskForm
        mode="create"
        defaultValues={emptyTaskValues}
        users={state.data.users}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/projects/${projectId}`)}
      />
    </div>
  )
}

/** /tasks/:taskId/edit — the same TaskForm, pre-filled from the API. */
export function EditTaskPage() {
  const taskId = Number(useParams().taskId)
  const navigate = useNavigate()
  const loader = useCallback(
    async (signal: AbortSignal) => {
      const [task, users] = await Promise.all([getTask(taskId, signal), getUsers(signal)])
      return { task, users }
    },
    [taskId],
  )
  const { state, reload } = useFetch(loader)

  async function handleSubmit(values: TaskFormValues) {
    await updateTask(taskId, formValuesToTaskInput(values))
    navigate(`/tasks/${taskId}`)
  }

  if (state.status === 'loading') return <LoadingState label="Loading task…" />
  if (state.status === 'error') {
    if (isNotFound(state.error)) return <NotFoundState title="Task not found" />
    return <ErrorState error={state.error} onRetry={reload} />
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit task" subtitle={state.data.task.title} />
      <TaskForm
        mode="edit"
        defaultValues={taskToFormValues(state.data.task)}
        users={state.data.users}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/tasks/${taskId}`)}
      />
    </div>
  )
}
