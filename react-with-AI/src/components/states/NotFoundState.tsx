import { Link } from 'react-router'
import { buttonClasses } from '@/lib/styles'

interface NotFoundStateProps {
  title?: string
  message?: string
  backTo?: string
  backLabel?: string
}

export function NotFoundState({
  title = 'Page not found',
  message = "The page you're looking for doesn't exist or was removed.",
  backTo = '/projects',
  backLabel = 'Back to projects',
}: NotFoundStateProps) {
  return (
    <div className="py-16 text-center">
      <p className="text-5xl font-bold text-indigo-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-slate-500">{message}</p>
      <Link to={backTo} className={`${buttonClasses('secondary')} mt-6`}>
        {backLabel}
      </Link>
    </div>
  )
}
