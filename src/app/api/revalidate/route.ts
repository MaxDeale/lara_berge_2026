import { revalidateTag } from 'next/cache'
import { parseBody } from 'next-sanity/webhook'
import type { NextRequest } from 'next/server'
import type { ContentTag } from '@/sanity/client'

const TAGS = new Set<ContentTag>(['artwork', 'siteSettings', 'faqItem', 'legalPage'])

/**
 * Sanity webhook: called when Lara publishes, and when the server writes an artwork's sold or
 * reserved status. Clears the cached pages for that document type so the change shows
 * on the next page load.
 *
 * Sanity → API → Webhooks: POST to /api/revalidate, projection `{_type}`,
 * secret = SANITY_REVALIDATE_SECRET.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) return new Response('Revalidation is not configured', { status: 500 })

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret, true)
  if (!isValidSignature) return new Response('Invalid signature', { status: 401 })

  const type = body?._type
  if (!type || !TAGS.has(type as ContentTag)) {
    return Response.json({ revalidated: false, reason: `Nothing cached for type ${type}` })
  }

  // expire: 0 so the very next visit gets fresh content (Lara expects to see her edit on reload)
  revalidateTag(type, { expire: 0 })
  return Response.json({ revalidated: true, tag: type })
}
