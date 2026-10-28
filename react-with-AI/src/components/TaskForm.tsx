import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { todayISO } from '@/lib/dates'
import { inputClasses } from '@/lib/styles'
import { getTaskSchema, type TaskFormMode, type TaskFormValues } from '@/schemas/task'
import { PRIORITY_LABELS, STATUS_LABELS, TASK_PRIORITIES, TASK_STATUSES, type User } from '@/types'

interface TaskFormProps {
  mode: TaskFormMode
  /** Empty values for create, values from the API for edit. */
  defaultValues: TaskFormValues
  users: User[]
  /** Should throw on failure; the form then shows the error and keeps the user's input. */
  onSubmit: (values: TaskFormValues) => Promise<void>
  onCancel: () => void
}

/** One form for both "create task" and "edit task". */
export function TaskForm({ mode, defaultValues, users, onSubmit, onCancel }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(getTaskSchema(mode)),
    defaultValues,
  })

  // handleSubmit only calls this when the schema passes, so invalid input never reaches the API.
  async function submit(values: TaskFormValues) {
    try {
      await onSubmit(values)
    } catch (error) {
      // Values stay in the form (we don't reset); just show what went wrong.
      setError('root.server', { message: error instanceof Error ? error.message : 'Could not save the task.' })
    }
  }

  // Small helper so every input gets the same accessibility wiring.
  const a11y = (name: keyof TaskFormValues) => ({
    id: `task-${name}`,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `task-${name}-error` : undefined,
  })

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5 rounded-lg bg-white p-6 shadow-sm">
      {errors.root?.server && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {errors.root.server.message}
        </p>
      )}

      <FormField label="Title" htmlFor="task-title" error={errors.title?.message}>
        <input {...register('title')} {...a11y('title')} className={inputClasses} />
      </FormField>

      <FormField label="Description" htmlFor="task-description" error={errors.description?.message}>
        <textarea {...register('description')} {...a11y('description')} rows={4} className={inputClasses} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Status" htmlFor="task-status" error={errors.status?.message}>
          <select {...register('status')} {...a11y('status')} className={inputClasses}>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Priority" htmlFor="task-priority" error={errors.priority?.message}>
          <select {...register('priority')} {...a11y('priority')} className={inputClasses}>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Assignee" htmlFor="task-assigneeId" error={errors.assigneeId?.message}>
          <select {...register('assigneeId')} {...a11y('assigneeId')} className={inputClasses}>
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={String(user.id)}>
                {user.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Due date" htmlFor="task-dueDate" error={errors.dueDate?.message}>
          <input
            type="date"
            {...register('dueDate')}
            {...a11y('dueDate')}
            min={mode === 'create' ? todayISO() : undefined}
            className={inputClasses}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        {/* Disabled while the request runs, so it can't be submitted twice. */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create task' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
