import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { emptyTaskValues, type TaskFormValues } from '@/schemas/task'
import { member } from '@/test/fixtures'
import { TaskForm } from './TaskForm'

function renderForm(mode: 'create' | 'edit', defaultValues: TaskFormValues = emptyTaskValues) {
  const onSubmit = vi.fn<(values: TaskFormValues) => Promise<void>>().mockResolvedValue(undefined)
  render(<TaskForm mode={mode} defaultValues={defaultValues} users={[member]} onSubmit={onSubmit} onCancel={vi.fn()} />)
  return { onSubmit, user: userEvent.setup() }
}

describe('TaskForm validation', () => {
  it('requires a title and a due date', async () => {
    const { onSubmit, user } = renderForm('create')

    await user.click(screen.getByRole('button', { name: 'Create task' }))

    expect(await screen.findByText('Title must be at least 3 characters')).toBeInTheDocument()
    expect(screen.getByText('Due date is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects titles longer than 100 characters', async () => {
    const { onSubmit, user } = renderForm('create')

    await user.type(screen.getByLabelText('Title'), 'a'.repeat(101))
    await user.click(screen.getByRole('button', { name: 'Create task' }))

    expect(await screen.findByText('Title must be at most 100 characters')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a due date in the past when creating', async () => {
    const { onSubmit, user } = renderForm('create')

    await user.type(screen.getByLabelText('Title'), 'Valid title')
    await user.type(screen.getByLabelText('Due date'), '2020-01-01')
    await user.click(screen.getByRole('button', { name: 'Create task' }))

    expect(await screen.findByText('Due date cannot be in the past')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('allows a past due date when editing an existing task', async () => {
    const { onSubmit, user } = renderForm('edit', { ...emptyTaskValues, title: 'Old task', dueDate: '2020-01-01' })

    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ title: 'Old task', dueDate: '2020-01-01' })
  })

  it('keeps the input and shows the error when saving fails', async () => {
    const { onSubmit, user } = renderForm('edit', { ...emptyTaskValues, title: 'My task', dueDate: '2999-01-01' })
    onSubmit.mockRejectedValue(new Error('Server exploded'))

    await user.clear(screen.getByLabelText('Title'))
    await user.type(screen.getByLabelText('Title'), 'Edited title')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Server exploded')
    expect(screen.getByLabelText('Title')).toHaveValue('Edited title')
  })
})
