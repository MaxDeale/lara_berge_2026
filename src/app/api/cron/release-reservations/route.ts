import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { releaseExpiredReservations } from '@/lib/orders/orders'

/**
 * Vercel Cron (see vercel.json): puts back originals whose 30-minute checkout reservation ran
 * out, and closes those abandoned orders. Checkout also ignores expired reservations, so this
 * only tidies up what the shop shows.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  const result = await releaseExpiredReservations()
  if (result.released) revalidateTag('artwork', { expire: 0 })
  return Response.json(result)
}
