import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import { AuthProvider } from '@/context/AuthProvider'

/** Renders routes the same way App does, but with an in-memory URL we control. */
export function renderWithRouter(routes: RouteObject[], initialUrl: string) {
  const router = createMemoryRouter(routes, { initialEntries: [initialUrl] })
  const result = render(
    <AuthProvider>
      <RouterProvider router={router} useTransitions={false} />
    </AuthProvider>,
  )
  return { ...result, router }
}
