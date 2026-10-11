import { headers } from 'next/headers'

const hits = new Map<string, number[]>()

/**
 * Simple per-IP limiter for the contact and commission forms. It lives in memory, so on
 * serverless it's per instance: enough to blunt a bot hammering one form, not a hard guarantee.
 */
export async function rateLimited(
  bucket: string,
  { max, windowMs }: { max: number; windowMs: number },
) {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  const key = `${bucket}:${ip}`
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= max) {
    hits.set(key, recent)
    return true
  }
  recent.push(now)
  hits.set(key, recent)
  // Keep the map from growing forever
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= windowMs)) hits.delete(k)
  }
  return false
}
