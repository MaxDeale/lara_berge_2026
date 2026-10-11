// Netlify scheduled function: the Netlify equivalent of the cron in vercel.json.
// Every 15 minutes it asks the site to release checkout reservations that ran out.

export const config = { schedule: '*/15 * * * *' }

export default async function releaseReservations() {
  const site = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL
  const secret = process.env.CRON_SECRET
  if (!site || !secret) {
    console.error('[cron] URL and CRON_SECRET must be set')
    return new Response('Not configured', { status: 500 })
  }
  const res = await fetch(`${site}/api/cron/release-reservations`, {
    headers: { authorization: `Bearer ${secret}` },
  })
  console.log('[cron] release-reservations', res.status, await res.text())
  return new Response(null, { status: res.ok ? 200 : 502 })
}
