'use server'

import { or } from '@/lib/artwork'
import { laraEmail, sendEmail } from '@/lib/email/send'
import { commissionAutoReply, commissionForLara } from '@/lib/email/templates'
import { commissionSchema } from '@/lib/forms/commission'
import { fieldErrors, type FormState } from '@/lib/forms/contact'
import { processReferenceImages } from '@/lib/forms/images'
import { rateLimited } from '@/lib/rateLimit'
import { writeClient } from '@/sanity/client'
import { getSettings } from '@/sanity/queries'

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

  if (await rateLimited('commission', { max: 3, windowMs: 10 * 60_000 })) {
    return {
      status: 'error',
      message: 'Lots of ideas at once! Please try again in a few minutes.',
      values,
    }
  }

  const images = await processReferenceImages(
    formData.getAll('references').filter((f): f is File => f instanceof File),
  )
  if ('error' in images) return { status: 'error', errors: { references: images.error }, values }

  const c = parsed.data
  let requestId: string
  let imageUrls: string[] = []
  try {
    const assets = await Promise.all(
      images.map((img) =>
        writeClient.assets.upload('image', img.buffer, { filename: img.filename }),
      ),
    )
    imageUrls = assets.map((a) => a.url)
    const doc = await writeClient.create({
      _type: 'commissionRequest',
      status: 'new',
      name: c.name,
      email: c.email,
      kind: c.kind,
      sizeOrUse: c.sizeOrUse,
      budget: c.budget,
      deadline: c.deadline || undefined,
      gift: c.gift === 'gift',
      idea: c.idea,
      sharePermission: c.share,
      references: assets.map((a, i) => ({
        _key: `ref${i}`,
        _type: 'image',
        asset: { _type: 'reference', _ref: a._id },
      })),
      createdAt: new Date().toISOString(),
    })
    requestId = doc._id
  } catch (error) {
    console.error('[commission] saving failed', error)
    return {
      status: 'error',
      message: "Sorry, your idea couldn't be sent just now. Please try again in a moment.",
      values,
    }
  }

  const settings = await getSettings()
  const details = { ...c, gift: c.gift === 'gift', imageUrls, requestId }
  const to = laraEmail()
  const results = await Promise.allSettled([
    to
      ? sendEmail(commissionForLara(details, to))
      : Promise.reject(new Error('LARA_EMAIL is not set')),
    sendEmail(commissionAutoReply(details, or(settings.commissionReplyDays, 'a few working days'))),
  ])
  // The request is safely in the Studio either way, so only log email problems
  for (const r of results)
    if (r.status === 'rejected') console.error('[commission] email failed', r.reason)

  return { status: 'sent' }
}
