'use server'

import { or } from '@/lib/artwork'
import { laraEmail, sendEmail } from '@/lib/email/send'
import { contactAutoReply, contactForLara } from '@/lib/email/templates'
import { contactSchema, fieldErrors, type FormState } from '@/lib/forms/contact'
import { rateLimited } from '@/lib/rateLimit'
import { getSettings } from '@/sanity/queries'

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

  if (await rateLimited('contact', { max: 5, windowMs: 10 * 60_000 })) {
    return {
      status: 'error',
      message: "That's a lot of notes in a short while! Please try again in a few minutes.",
      values,
    }
  }

  const to = laraEmail()
  if (!to) {
    console.error('[contact] LARA_EMAIL is not set')
    return {
      status: 'error',
      message: "Sorry, the message couldn't be sent just now. Please try again later.",
      values,
    }
  }

  try {
    await sendEmail(contactForLara(parsed.data, to))
  } catch (error) {
    console.error('[contact] sending to Lara failed', error)
    return {
      status: 'error',
      message: "Sorry, the message couldn't be sent just now. Please try again later.",
      values,
    }
  }

  // The auto-reply is a courtesy: don't fail the form if only this part goes wrong
  const settings = await getSettings()
  await sendEmail(
    contactAutoReply(parsed.data, or(settings.replyTime, '1 to 2 working days')),
  ).catch((e) => console.error('[contact] auto-reply failed', e))
  return { status: 'sent' }
}
