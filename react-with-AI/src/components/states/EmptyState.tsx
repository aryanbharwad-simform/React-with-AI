import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  message?: string
  /** Optional call to action, e.g. a "New task" link or "Clear filters" button. */
  action?: ReactNode
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <h2 className="font-semibold text-slate-800">{title}</h2>
      {message && <p className="mt-1 text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
