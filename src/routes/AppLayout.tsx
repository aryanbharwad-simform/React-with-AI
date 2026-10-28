import { NavLink, Outlet } from 'react-router'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`

/** Shared shell for logged-in screens: header + the current page in <Outlet />. */
export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <NavLink to="/projects" className="text-lg font-bold text-indigo-600">
            TaskFlow
          </NavLink>
          <nav className="flex gap-1" aria-label="Main">
            <NavLink to="/projects" className={navLinkClass}>
              Projects
            </NavLink>
            <NavLink to="/my-tasks" className={navLinkClass}>
              My tasks
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-slate-600">
              {user?.name}
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize">{user?.role}</span>
            </span>
            <Button variant="ghost" onClick={() => logout()}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
