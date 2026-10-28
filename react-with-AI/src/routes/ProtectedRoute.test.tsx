import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import * as authService from '@/services/authService'
import { admin, logInAs, member } from '@/test/fixtures'
import { renderWithRouter } from '@/test/renderWithRouter'
import { LoginPage } from '@/pages/LoginPage'
import { AdminRoute } from './AdminRoute'
import { ProtectedRoute } from './ProtectedRoute'

// Small stand-in pages: these tests are about the guards, not the real screens.
const routes = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/projects/:projectId', element: <h1>Project screen</h1> },
      { element: <AdminRoute />, children: [{ path: '/projects/new', element: <h1>New project screen</h1> }] },
    ],
  },
]

describe('ProtectedRoute', () => {
  it('redirects to login when logged out, then back to the original URL', async () => {
    vi.spyOn(authService, 'login').mockResolvedValue({ accessToken: 'token', user: member })
    const { router } = renderWithRouter(routes, '/projects/2?status=done')

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.queryByText('Project screen')).not.toBeInTheDocument()

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email'), 'mohan@taskflow.dev')
    await user.type(screen.getByLabelText('Password'), 'Member@123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { name: 'Project screen' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/projects/2')
    expect(router.state.location.search).toBe('?status=done')
  })

  it('lets a logged-in user through', async () => {
    logInAs(member)
    renderWithRouter(routes, '/projects/2')
    expect(await screen.findByRole('heading', { name: 'Project screen' })).toBeInTheDocument()
  })
})

describe('AdminRoute', () => {
  it('blocks a member who types an admin URL directly', async () => {
    logInAs(member)
    renderWithRouter(routes, '/projects/new')
    expect(await screen.findByRole('heading', { name: 'Admins only' })).toBeInTheDocument()
    expect(screen.queryByText('New project screen')).not.toBeInTheDocument()
  })

  it('lets an admin through', async () => {
    logInAs(admin)
    renderWithRouter(routes, '/projects/new')
    expect(await screen.findByRole('heading', { name: 'New project screen' })).toBeInTheDocument()
  })
})
