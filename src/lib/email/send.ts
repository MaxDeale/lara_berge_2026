import { appendFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { Resend } from 'resend'

export type Email = {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

/**
 * Sends through Resend when RESEND_API_KEY and MAIL_FROM are set. Without them the email is
 * logged and skipped, so nothing reaches a customer until Max switches email on.
 * EMAIL_TEST_OUTBOX=<file> writes emails to a JSON-lines file instead (used by the e2e tests).
 */
export async function sendEmail(email: Email): Promise<{ sent: boolean }> {
  const outbox = process.env.EMAIL_TEST_OUTBOX
  if (outbox) {
    await mkdir(dirname(outbox), { recursive: true })
    await appendFile(outbox, JSON.stringify({ ...email, at: new Date().toISOString() }) + '\n')
    return { sent: false }
  }

  const key = process.env.RESEND_API_KEY
  const from = process.env.MAIL_FROM
  if (!key || !from) {
    console.info(`[email] Resend isn't configured, skipped "${email.subject}" to ${email.to}`)
    return { sent: false }
  }

  const { error } = await new Resend(key).emails.send({
    from,
    to: email.to,
    subject: email.subject,
    html: email.html,
    text: email.text,
    replyTo: email.replyTo,
  })
  if (error) throw new Error(`Resend: ${error.name}: ${error.message}`)
  return { sent: true }
}

/** Lara's inbox for orders, commissions and contact messages */
export const laraEmail = () => process.env.LARA_EMAIL || ''
