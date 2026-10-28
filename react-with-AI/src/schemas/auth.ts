import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
})

/** The form's TypeScript type is inferred from the schema, so the two can never drift apart. */
export type LoginValues = z.infer<typeof loginSchema>
