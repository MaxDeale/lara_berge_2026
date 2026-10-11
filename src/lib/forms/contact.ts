import { z } from 'zod'

export const CONTACT_TOPICS = [
  'A painting or print',
  'Help with an order',
  'A commission',
  'Collaboration or press',
  'Just saying hello',
] as const

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please tell Lara your name').max(120),
  email: z.email({ error: "That email doesn't look quite right" }).trim().max(200),
  topic: z.enum(CONTACT_TOPICS, { error: 'Please choose a topic' }),
  message: z
    .string()
    .trim()
    .min(5, 'Your message looks a little short')
    .max(5000, 'Please keep it under 5000 characters'),
})

export type ContactInput = z.infer<typeof contactSchema>

export type FormState = {
  status: 'idle' | 'sent' | 'error'
  message?: string
  errors?: Partial<Record<string, string>>
  values?: Record<string, string>
}

/** First error message per field, for showing under each input */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    out[key] ??= issue.message
  }
  return out
}
