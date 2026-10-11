'use server'

import { commissionSchema } from '@/lib/forms/commission'
import { fieldErrors, type FormState } from '@/lib/forms/contact'

export async function sendCommission(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = Object.fromEntries(
    ['name', 'email', 'kind', 'sizeOrUse', 'budget', 'deadline', 'gift', 'idea'].map((k) => [
      k,
      String(formData.get(k) ?? ''),
    ]),
  )

  if (String(formData.get('website') ?? '') !== '') return { status: 'sent' }

  const parsed = commissionSchema.safeParse({ ...values, share: formData.get('share') === 'on' })
  if (!parsed.success) {
    return { status: 'error', errors: fieldErrors(parsed.error), values }
  }

  // Phase 5: rate limit, check and resize the reference images, upload them to Sanity, create the
  // commissionRequest, email Lara and send the auto-reply.
  return { status: 'sent' }
}
