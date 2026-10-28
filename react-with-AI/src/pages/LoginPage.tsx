import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation } from 'react-router'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { useAuth } from '@/hooks/useAuth'
import { inputClasses } from '@/lib/styles'
import { loginSchema, type LoginValues } from '@/schemas/auth'

/** ProtectedRoute puts `{ from: '/projects/2?status=done' }` in the location state. */
function getRedirectTarget(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state && typeof state.from === 'string') {
    return state.from
  }
  return '/projects'
}

export function LoginPage() {
  const { user, login, notice } = useAuth()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  // Already logged in (or just logged in: login() updates the context and we re-render).
  if (user) return <Navigate to={getRedirectTarget(location.state)} replace />

  async function onSubmit(values: LoginValues) {
    try {
      await login(values)
    } catch (error) {
      setError('root.server', { message: error instanceof Error ? error.message : 'Login failed.' })
    }
  }

  const message = errors.root?.server?.message ?? notice

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl font-bold text-indigo-600">TaskFlow</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Sign in to your team workspace</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5 rounded-lg bg-white p-6 shadow-sm">
          {message && (
            <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {message}
            </p>
          )}

          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={inputClasses}
            />
          </FormField>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </main>
  )
}
