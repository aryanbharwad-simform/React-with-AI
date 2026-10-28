import { z } from 'zod'

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(60, 'Name must be at most 60 characters'),
  description: z.string().trim().max(300, 'Description must be at most 300 characters'),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
