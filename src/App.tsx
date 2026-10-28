import { createBrowserRouter, RouterProvider } from 'react-router'
import { AuthProvider } from '@/context/AuthProvider'
import { routes } from '@/routes/routes'

// Created once, outside the component, so it isn't rebuilt on every render.
const router = createBrowserRouter(routes)

function App() {
  return (
    // AuthProvider wraps everything, so any component can call useAuth().
    <AuthProvider>
      {/* useTransitions={false}: apply URL changes immediately, so the search box (whose value
          comes from the URL) updates as you type. */}
      <RouterProvider router={router} useTransitions={false} />
    </AuthProvider>
  )
}

export default App
