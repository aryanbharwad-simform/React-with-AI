import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/services/apiClient'
import * as authService from '@/services/authService'
import { admin } from '@/test/fixtures'
import { renderWithRouter } from '@/test/renderWithRouter'
import { LoginPage } from './LoginPage'

const routes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/projects', element: <h1>Projects screen</h1> },
]

describe('LoginPage', () => {
  beforeEach(() => {
    vi.spyOn(authService, 'login')
  })

  it('shows field errors and does not call the API when input is invalid', async () => {
    const user = userEvent.setup()
    renderWithRouter(routes, '/login')

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()

    expect(authService.login).not.toHaveBeenCalled()
  })

  it('shows one generic message for a wrong password', async () => {
    vi.mocked(authService.login).mockRejectedValue(new ApiError(authService.INVALID_CREDENTIALS_MESSAGE, 400))
    const user = userEvent.setup()
    renderWithRouter(routes, '/login')

    await user.type(screen.getByLabelText('Email'), 'admin@taskflow.dev')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.')
    expect(screen.getByLabelText('Email')).toHaveValue('admin@taskflow.dev') // input is kept
    expect(localStorage.length).toBe(0)
  })

  it('logs in, redirects, and never stores the password', async () => {
    vi.mocked(authService.login).mockResolvedValue({ accessToken: 'token-123', user: admin })
    const user = userEvent.setup()
    renderWithRouter(routes, '/login')

    await user.type(screen.getByLabelText('Email'), 'admin@taskflow.dev')
    await user.type(screen.getByLabelText('Password'), 'Admin@123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { name: 'Projects screen' })).toBeInTheDocument()
    const stored = JSON.stringify({ ...localStorage })
    expect(stored).toContain('token-123')
    expect(stored).not.toContain('Admin@123')
  })
})
