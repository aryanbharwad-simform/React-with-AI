import { Link, Outlet } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { buttonClasses } from '@/lib/styles'

/**
 * Blocks members from admin screens even when they type the URL directly.
 * This is UX only: the real enforcement must happen on the server (json-server-auth can't do roles).
 */
export function AdminRoute() {
  const { isAdmin } = useAuth()

  if (!isAdmin) {
    return (
      <div className="py-16 text-center">
        <p className="text-5xl font-bold text-indigo-600">403</p>
        <h1 className="mt-4 text-2xl font-semibold">Admins only</h1>
        <p className="mt-2 text-slate-500">You don't have permission to view this page.</p>
        <Link to="/projects" className={`${buttonClasses('secondary')} mt-6`}>
          Back to projects
        </Link>
      </div>
    )
  }

  return <Outlet />
}
