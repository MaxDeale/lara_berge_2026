import { z } from 'zod'

export const DIGITAL_USES = [
  'A print for my wall',
  'A gift or card',
  'A book cover or project',
  'Something else',
] as const

export const commissionSchema = z.object({
  name: z.string().trim().min(1, 'Please tell Lara your name').max(120),
  email: z.email({ error: "That email doesn't look quite right" }).trim().max(200),
  kind: z.enum(['oil', 'digital'], { error: 'Choose oil or digital' }),
  sizeOrUse: z.string().trim().min(1, 'Please choose one').max(120),
  budget: z.string().trim().min(1, 'Please choose one').max(120),
  deadline: z.union([z.literal(''), z.iso.date({ error: 'Please pick a date' })]),
  gift: z.enum(['me', 'gift']),
  idea: z
    .string()
    .trim()
    .min(10, 'Tell Lara a little more about your idea')
    .max(5000, 'Please keep it under 5000 characters'),
  share: z.boolean(),
})

export type CommissionInput = z.infer<typeof commissionSchema>

export const MAX_REFERENCES = 5
export const MAX_REFERENCE_BYTES = 10 * 1024 * 1024
