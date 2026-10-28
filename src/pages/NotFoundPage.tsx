import { NotFoundState } from '@/components/states/NotFoundState'

/** Any URL that matches no route. */
export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-3xl px-4">
      <NotFoundState backTo="/" backLabel="Go home" />
    </main>
  )
}
