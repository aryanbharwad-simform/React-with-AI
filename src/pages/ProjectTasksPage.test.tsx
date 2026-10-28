import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/services/apiClient'
import * as projectService from '@/services/projectService'
import * as taskService from '@/services/taskService'
import * as userService from '@/services/userService'
import { logInAs, makeTask, member, project } from '@/test/fixtures'
import { renderWithRouter } from '@/test/renderWithRouter'
import { ProjectTasksPage } from './ProjectTasksPage'

const routes = [{ path: '/projects/:projectId', element: <ProjectTasksPage /> }]

describe('ProjectTasksPage', () => {
  beforeEach(() => {
    logInAs(member)
    vi.spyOn(projectService, 'getProject').mockResolvedValue(project)
    vi.spyOn(userService, 'getUsers').mockResolvedValue([member])
    vi.spyOn(taskService, 'getTasks')
  })

  it('shows a loading state while tasks load', async () => {
    vi.mocked(taskService.getTasks).mockReturnValue(new Promise(() => {})) // never resolves
    renderWithRouter(routes, '/projects/1')
    expect(await screen.findByRole('status')).toHaveTextContent('Loading tasks')
  })

  it('shows an empty state when the project has no tasks', async () => {
    vi.mocked(taskService.getTasks).mockResolvedValue([])
    renderWithRouter(routes, '/projects/1')
    expect(await screen.findByRole('heading', { name: 'No tasks yet' })).toBeInTheDocument()
  })

  it('shows an error with a working retry button', async () => {
    vi.mocked(taskService.getTasks)
      .mockRejectedValueOnce(new ApiError('Cannot reach the server.', 0))
      .mockResolvedValueOnce([makeTask({ title: 'Recovered task' })])
    renderWithRouter(routes, '/projects/1')

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Cannot reach the server.')

    await userEvent.setup().click(within(alert).getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('link', { name: 'Recovered task' })).toBeInTheDocument()
  })

  it('renders tasks and applies filters from the URL', async () => {
    vi.mocked(taskService.getTasks).mockResolvedValue([
      makeTask({ id: 1, title: 'Open task', status: 'todo' }),
      makeTask({ id: 2, title: 'Finished task', status: 'done' }),
      makeTask({ id: 3, title: 'Late task', status: 'in_progress', dueDate: '2000-01-01' }),
    ])
    renderWithRouter(routes, '/projects/1?status=done')

    expect(await screen.findByRole('link', { name: 'Finished task' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Open task' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toHaveValue('done')
  })

  it('marks overdue tasks', async () => {
    vi.mocked(taskService.getTasks).mockResolvedValue([makeTask({ title: 'Late task', dueDate: '2000-01-01' })])
    renderWithRouter(routes, '/projects/1')
    const row = (await screen.findByRole('link', { name: 'Late task' })).closest('tr')
    expect(row).not.toBeNull()
    expect(within(row as HTMLElement).getByText('Overdue')).toBeInTheDocument()
  })

  it('shows a not-found state for a project that does not exist', async () => {
    vi.mocked(projectService.getProject).mockRejectedValue(new ApiError('Not found.', 404))
    vi.mocked(taskService.getTasks).mockResolvedValue([])
    renderWithRouter(routes, '/projects/9999')
    expect(await screen.findByRole('heading', { name: 'Project not found' })).toBeInTheDocument()
  })
})
