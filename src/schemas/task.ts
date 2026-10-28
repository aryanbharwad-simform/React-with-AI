import { z } from 'zod'
import { todayISO } from '@/lib/dates'
import { TASK_PRIORITIES, TASK_STATUSES, type Task, type TaskInput } from '@/types'

const dueDate = z
  .string()
  .min(1, 'Due date is required')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date')

/** Shape of the form. The <select> for assignee gives a string ('' = unassigned). */
const taskBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters'),
  description: z.string().trim().max(1000, 'Description must be at most 1000 characters'),
  status: z.enum(TASK_STATUSES, 'Status is required'),
  priority: z.enum(TASK_PRIORITIES, 'Priority is required'),
  assigneeId: z.string(),
  dueDate,
})

export type TaskFormValues = z.infer<typeof taskBaseSchema>
export type TaskFormMode = 'create' | 'edit'

/** On create the due date can't be in the past; editing an old (overdue) task must still work. */
export function getTaskSchema(mode: TaskFormMode) {
  if (mode === 'edit') return taskBaseSchema
  return taskBaseSchema.extend({
    dueDate: dueDate.refine((value) => value >= todayISO(), 'Due date cannot be in the past'),
  })
}

export const emptyTaskValues: TaskFormValues = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assigneeId: '',
  dueDate: '',
}

/** API task -> form values (edit pre-fill). */
export function taskToFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assigneeId === null ? '' : String(task.assigneeId),
    dueDate: task.dueDate,
  }
}

/** Form values -> API body. */
export function formValuesToTaskInput(
  values: TaskFormValues,
): Omit<TaskInput, 'projectId' | 'createdAt'> {
  return {
    title: values.title,
    description: values.description,
    status: values.status,
    priority: values.priority,
    assigneeId: values.assigneeId === '' ? null : Number(values.assigneeId),
    dueDate: values.dueDate,
  }
}
