'use server'

import { contactSchema, fieldErrors, type FormState } from '@/lib/forms/contact'

export async function sendContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = Object.fromEntries(
    ['name', 'email', 'topic', 'message'].map((k) => [k, String(formData.get(k) ?? '')]),
  )

  // Honeypot: bots fill every field; pretend it worked so they don't retry
  if (String(formData.get('website') ?? '') !== '') return { status: 'sent' }

  const parsed = contactSchema.safeParse(values)
  if (!parsed.success) {
    return { status: 'error', errors: fieldErrors(parsed.error), values }
  }

  // Phase 5: rate limit, email Lara and send the auto-reply via Resend.
  return { status: 'sent' }
}
