import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

/** Wraps every screen except /login. Logged out -> go to /login, remembering where you wanted to go. */
export function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const from = location.pathname + location.search + location.hash
    return <Navigate to="/login" replace state={{ from }} />
  }

  // <Outlet /> renders whichever child route matched.
  return <Outlet />
}
