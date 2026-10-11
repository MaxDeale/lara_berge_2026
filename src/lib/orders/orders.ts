import { randomBytes, randomUUID } from 'node:crypto'
import { readClient, writeClient } from '@/sanity/client'
import type { PricedLine } from './pricing'
import type { CheckoutInput } from './schema'

export const RESERVATION_MINUTES = 30

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

/** Unguessable id used in /order/[id] and as PayFast's m_payment_id */
export function newOrderId(): string {
  const bytes = randomBytes(22)
  let id = ''
  for (const b of bytes) id += ALPHABET[b % ALPHABET.length]
  return `order-${id}`
}

export const isOrderId = (id: string) => /^order-[A-Za-z0-9]{22}$/.test(id)

/** Next human reference, e.g. LB-0042. The counter is incremented atomically by Sanity. */
export async function nextReference(): Promise<string> {
  await writeClient.createIfNotExists({ _id: 'orderCounter', _type: 'counter', seq: 0 })
  const doc = await writeClient.patch('orderCounter').inc({ seq: 1 }).commit<{ seq: number }>()
  return `LB-${String(doc.seq).padStart(4, '0')}`
}

const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

export class ReservationConflict extends Error {}

/**
 * Creates the pending order and reserves every original in one transaction. Each artwork patch
 * carries ifRevisionID, so if anyone else touched that artwork since we priced it (another buyer
 * reserving it, Lara marking it sold) the whole transaction fails and nothing is reserved.
 */
export async function createPendingOrder(args: {
  orderId: string
  reference: string
  input: CheckoutInput
  lines: PricedLine[]
  subtotal: number
  shipping: number
  total: number
}) {
  const { orderId, reference, input, lines } = args
  const now = new Date()
  const until = new Date(now.getTime() + RESERVATION_MINUTES * 60_000).toISOString()

  const tx = writeClient.transaction()
  for (const line of lines.filter((l) => l.type === 'original')) {
    tx.patch(line.artworkId, (p) =>
      p.ifRevisionId(line.rev).set({
        'original.status': 'reserved',
        'original.reservedUntil': until,
        'original.reservedBy': orderId,
      }),
    )
  }
  tx.create({
    _id: orderId,
    _type: 'order',
    reference,
    status: 'pending',
    createdAt: now.toISOString(),
    items: lines.map((l) => ({
      _key: key(),
      _type: 'orderItem',
      artwork: { _type: 'reference', _ref: l.artworkId, _weak: true },
      title: l.title,
      type: l.type,
      size: l.size,
      unitPrice: l.unitPrice,
      qty: l.qty,
    })),
    customer: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
    },
    delivery:
      input.method === 'collect'
        ? { method: 'collect' }
        : { method: input.method, ...input.address },
    notes: input.notes,
    gift: input.gift,
    subtotal: args.subtotal,
    shipping: args.shipping,
    total: args.total,
  })

  try {
    await tx.commit({ visibility: 'sync' })
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode
    if (status === 409)
      throw new ReservationConflict('An original was reserved or sold a moment ago')
    throw error
  }
}

export type StoredOrder = {
  _id: string
  reference: string
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'shipped'
  total: number
  subtotal: number
  shipping: number
  pfPaymentId?: string
  customer: { firstName: string; lastName: string; email: string; phone?: string }
  delivery: {
    method: string
    line1?: string
    suburb?: string
    city?: string
    province?: string
    postalCode?: string
    country?: string
  }
  notes?: string
  gift?: boolean
  items: Array<{
    title: string
    type: 'original' | 'print'
    size?: string
    unitPrice: number
    qty: number
    artworkId?: string
    image?: { url: string; lqip?: string; width: number; height: number } | null
  }>
}

export async function getOrder(orderId: string): Promise<StoredOrder | null> {
  if (!isOrderId(orderId)) return null
  return writeClient.fetch<StoredOrder | null>(
    `*[_id == $id][0]{
      _id, reference, status, total, subtotal, shipping, pfPaymentId, customer, delivery, notes, gift,
      "items": items[]{ title, type, size, unitPrice, qty, "artworkId": artwork._ref,
        "image": artwork->mainImage{ "url": asset->url, "lqip": asset->metadata.lqip, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height } }
    }`,
    { id: orderId },
    { cache: 'no-store' },
  )
}

/** Puts back any originals this order still holds. Safe to call more than once. */
export async function releaseReservations(orderId: string) {
  const held = await writeClient.fetch<Array<{ _id: string }>>(
    `*[_type == "artwork" && original.status == "reserved" && original.reservedBy == $id]{ _id }`,
    { id: orderId },
    { cache: 'no-store' },
  )
  if (!held.length) return 0
  const tx = writeClient.transaction()
  for (const a of held) {
    tx.patch(a._id, (p) =>
      p
        .set({ 'original.status': 'available' })
        .unset(['original.reservedUntil', 'original.reservedBy']),
    )
  }
  await tx.commit({ visibility: 'sync' })
  return held.length
}

/** A pending order the shopper walked away from (or that PayFast reports as not paid) */
export async function closeUnpaidOrder(orderId: string, status: 'failed' | 'cancelled') {
  const order = await readClient.fetch<{ status: string } | null>(
    `*[_id == $id][0]{ status }`,
    { id: orderId },
    { cache: 'no-store' },
  )
  if (!order || order.status !== 'pending') return false
  await writeClient.patch(orderId).set({ status }).commit()
  await releaseReservations(orderId)
  return true
}

/**
 * Marks an order paid and its originals sold. Returns originals that could not be marked sold
 * because the reservation lapsed and someone else bought them meanwhile (needs Lara's attention).
 */
export async function markOrderPaid(
  orderId: string,
  payment: { pfPaymentId: string; paymentStatus: string },
) {
  const order = await writeClient.fetch<{
    status: string
    items: Array<{ type: string; artworkId: string; title: string }>
  } | null>(
    `*[_id == $id][0]{ status, "items": items[]{ type, "artworkId": artwork._ref, title } }`,
    { id: orderId },
    { cache: 'no-store' },
  )
  if (!order) throw new Error(`Order ${orderId} not found`)

  const originals = order.items.filter((i) => i.type === 'original')
  const arts = await writeClient.fetch<
    Array<{ _id: string; status?: string; reservedBy?: string }>
  >(
    `*[_id in $ids]{ _id, "status": original.status, "reservedBy": original.reservedBy }`,
    { ids: originals.map((o) => o.artworkId) },
    { cache: 'no-store' },
  )
  const conflicts: string[] = []
  const tx = writeClient.transaction()
  for (const item of originals) {
    const art = arts.find((a) => a._id === item.artworkId)
    const ours =
      art &&
      (art.reservedBy === orderId ||
        art.status === 'available' ||
        (art.status === 'reserved' && !art.reservedBy))
    if (ours) {
      tx.patch(item.artworkId, (p) =>
        p
          .set({ 'original.status': 'sold' })
          .unset(['original.reservedUntil', 'original.reservedBy']),
      )
    } else {
      conflicts.push(item.title)
    }
  }
  tx.patch(orderId, (p) =>
    p.set({
      status: 'paid',
      paidAt: new Date().toISOString(),
      pfPaymentId: payment.pfPaymentId,
      paymentStatus: payment.paymentStatus,
      ...(conflicts.length && {
        internalNotes: `Needs attention: paid after the reservation lapsed, and ${conflicts.join(', ')} had already gone to someone else. Contact the buyer about a refund or alternative.`,
      }),
    }),
  )
  await tx.commit({ visibility: 'sync' })
  return { conflicts }
}

export async function logItn(
  orderId: string,
  entry: { paymentStatus: string; outcome: string; payload: string },
) {
  await writeClient
    .patch(orderId)
    .setIfMissing({ itnLog: [] })
    .append('itnLog', [
      { _key: key(), _type: 'itnEntry', receivedAt: new Date().toISOString(), ...entry },
    ])
    .commit()
}

/** Releases every reservation whose 30 minutes are up, and closes those abandoned orders */
export async function releaseExpiredReservations(now = new Date()) {
  const expired = await writeClient.fetch<Array<{ _id: string; reservedBy?: string }>>(
    `*[_type == "artwork" && original.status == "reserved" && (!defined(original.reservedUntil) || original.reservedUntil < $now)]{ _id, "reservedBy": original.reservedBy }`,
    { now: now.toISOString() },
    { cache: 'no-store' },
  )
  const orders = [...new Set(expired.map((a) => a.reservedBy).filter((id): id is string => !!id))]
  for (const id of orders) {
    await closeUnpaidOrder(id, 'cancelled')
    // Also covers an order closed some other way that still holds a piece
    await releaseReservations(id)
  }
  // Anything left (no order on record) is simply put back
  const stillHeld = expired.filter((a) => !a.reservedBy)
  if (stillHeld.length) {
    const tx = writeClient.transaction()
    for (const a of stillHeld) {
      tx.patch(a._id, (p) =>
        p
          .set({ 'original.status': 'available' })
          .unset(['original.reservedUntil', 'original.reservedBy']),
      )
    }
    await tx.commit()
  }
  return { released: expired.length, ordersClosed: orders.length }
}
