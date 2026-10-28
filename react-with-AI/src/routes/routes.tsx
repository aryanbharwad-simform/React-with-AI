import { Navigate, type RouteObject } from 'react-router'
import { LoginPage } from '@/pages/LoginPage'
import { MyTasksPage } from '@/pages/MyTasksPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProjectFormPage } from '@/pages/ProjectFormPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ProjectTasksPage } from '@/pages/ProjectTasksPage'
import { TaskDetailPage } from '@/pages/TaskDetailPage'
import { CreateTaskPage, EditTaskPage } from '@/pages/TaskFormPages'
import { AdminRoute } from './AdminRoute'
import { AppLayout } from './AppLayout'
import { ProtectedRoute } from './ProtectedRoute'

/**
 * The route tree. Guards are "layout routes": they render <Outlet /> for their children
 * or redirect/block. Exported separately so tests can mount it in a memory router.
 */
export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/projects" replace /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'projects/:projectId', element: <ProjectTasksPage /> },
          { path: 'projects/:projectId/tasks/new', element: <CreateTaskPage /> },
          { path: 'tasks/:taskId', element: <TaskDetailPage /> },
          { path: 'tasks/:taskId/edit', element: <EditTaskPage /> },
          { path: 'my-tasks', element: <MyTasksPage /> },
          {
            element: <AdminRoute />,
            children: [
              { path: 'projects/new', element: <ProjectFormPage /> },
              { path: 'projects/:projectId/edit', element: <ProjectFormPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]
