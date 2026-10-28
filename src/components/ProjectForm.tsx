import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { inputClasses } from '@/lib/styles'
import { projectSchema, type ProjectFormValues } from '@/schemas/project'

interface ProjectFormProps {
  defaultValues: ProjectFormValues
  submitLabel: string
  onSubmit: (values: ProjectFormValues) => Promise<void>
  onCancel: () => void
}

export function ProjectForm({ defaultValues, submitLabel, onSubmit, onCancel }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({ resolver: zodResolver(projectSchema), defaultValues })

  async function submit(values: ProjectFormValues) {
    try {
      await onSubmit(values)
    } catch (error) {
      setError('root.server', { message: error instanceof Error ? error.message : 'Could not save the project.' })
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5 rounded-lg bg-white p-6 shadow-sm">
      {errors.root?.server && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {errors.root.server.message}
        </p>
      )}

      <FormField label="Name" htmlFor="project-name" error={errors.name?.message}>
        <input
          id="project-name"
          {...register('name')}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'project-name-error' : undefined}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Description" htmlFor="project-description" error={errors.description?.message}>
        <textarea
          id="project-description"
          rows={3}
          {...register('description')}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? 'project-description-error' : undefined}
          className={inputClasses}
        />
      </FormField>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
