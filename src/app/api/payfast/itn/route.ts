import { revalidateTag } from 'next/cache'
import { after, type NextRequest } from 'next/server'
import { sendEmail, laraEmail } from '@/lib/email/send'
import { newOrderForLara, orderConfirmation } from '@/lib/email/templates'
import { closeUnpaidOrder, getOrder, isOrderId, logItn, markOrderPaid } from '@/lib/orders/orders'
import { runItnChecks, sourceIp } from '@/lib/payfast/itn'

/**
 * PayFast's Instant Transaction Notification. PayFast wants a 200 straight away (otherwise it
 * retries), so the checks and order updates run after the response is sent.
 */
export async function POST(request: NextRequest) {
  const raw = await request.text()
  // URLSearchParams keeps the order PayFast sent, which the signature depends on
  const posted = [...new URLSearchParams(raw).entries()]
  const ip = sourceIp(request.headers)
  after(() => handleItn(posted, ip, raw).catch((e) => console.error('[itn] failed', e)))
  return new Response('OK', { status: 200 })
}

async function handleItn(posted: Array<[string, string]>, ip: string | null, raw: string) {
  const data = Object.fromEntries(posted)
  const orderId = data.m_payment_id ?? ''
  const status = (data.payment_status ?? '').toUpperCase()
  if (!isOrderId(orderId)) {
    console.warn('[itn] unknown m_payment_id', orderId)
    return
  }
  const order = await getOrder(orderId)
  if (!order) {
    console.warn('[itn] no order for', orderId)
    return
  }
  const log = (outcome: string) =>
    logItn(orderId, { paymentStatus: status, outcome, payload: raw.slice(0, 5000) })

  const checks = await runItnChecks(posted, ip, order.total)
  const failed = Object.entries(checks)
    .filter(([, ok]) => !ok)
    .map(([name]) => name)
  if (failed.length) {
    await log(
      `Rejected: failed ${failed.join(', ')} check${failed.length > 1 ? 's' : ''} (from ${ip ?? 'unknown IP'})`,
    )
    return
  }

  // Idempotent on pf_payment_id: PayFast may send the same notification more than once
  if (order.pfPaymentId && order.pfPaymentId === data.pf_payment_id && order.status !== 'pending') {
    await log('Duplicate notification, already handled')
    return
  }

  if (status === 'COMPLETE') {
    if (order.status === 'paid' || order.status === 'shipped') {
      await log('Already paid, ignored')
      return
    }
    const { conflicts } = await markOrderPaid(orderId, {
      pfPaymentId: data.pf_payment_id ?? '',
      paymentStatus: status,
    })
    revalidateTag('artwork', { expire: 0 })
    await log(conflicts.length ? `Paid, but already sold: ${conflicts.join(', ')}` : 'Paid')

    const paid = await getOrder(orderId)
    if (paid) {
      const results = await Promise.allSettled([
        sendEmail(orderConfirmation(paid)),
        laraEmail() ? sendEmail(newOrderForLara(paid, laraEmail(), conflicts)) : Promise.resolve(),
      ])
      for (const r of results)
        if (r.status === 'rejected') console.error('[itn] email failed', r.reason)
    }
    return
  }

  if (status === 'FAILED' || status === 'CANCELLED') {
    const closed = await closeUnpaidOrder(orderId, status === 'FAILED' ? 'failed' : 'cancelled')
    if (closed) revalidateTag('artwork', { expire: 0 })
    await log(
      closed
        ? `Order marked ${status.toLowerCase()}, reservations released`
        : `Ignored: order is ${order.status}`,
    )
    return
  }

  await log(`No action for status ${status || '(none)'}`)
}
