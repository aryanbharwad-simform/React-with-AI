import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  /** The input itself. It should set aria-invalid and aria-describedby={`${htmlFor}-error`}. */
  children: ReactNode
}

/** Label + input + per-field error message. */
export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
