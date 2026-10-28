import { Button } from '@/components/ui/Button'

interface ErrorStateProps {
  title?: string
  error: Error
  onRetry: () => void
}

export function ErrorState({ title = 'Something went wrong', error, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <h2 className="font-semibold text-red-800">{title}</h2>
      <p className="mt-1 text-sm text-red-700">{error.message}</p>
      <Button variant="secondary" className="mt-4" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
