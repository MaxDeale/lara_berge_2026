'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { fieldErrors } from '@/lib/forms/contact'
import {
  closeUnpaidOrder,
  createPendingOrder,
  getOrder,
  isOrderId,
  newOrderId,
  nextReference,
  ReservationConflict,
} from '@/lib/orders/orders'
import { priceCart } from '@/lib/orders/pricing'
import {
  cartSchema,
  checkoutSchema,
  DELIVERY_METHODS,
  type DeliveryMethod,
} from '@/lib/orders/schema'
import { buildPayfastRedirect, type PayfastRedirect } from '@/lib/payfast/checkout'
import { payfastConfig } from '@/lib/payfast/config'
import { siteUrl } from '@/lib/site'

export type CheckoutQuote = {
  lines: Array<{
    key: string
    title: string
    image: {
      url: string
      lqip?: string
      width: number
      height: number
      alt?: string
      hotspot?: { x: number; y: number }
    } | null
    label: string
    qty: number
    lineTotal: number
  }>
  problems: string[]
  subtotal: number
  shipping: number | null
  shippingLabel: string
  total: number | null
  rates: Record<
    DeliveryMethod,
    { label: string; note?: string; price: number | null; available: boolean }
  >
}

/** The order summary, priced on the server from fresh Sanity data */
export async function quoteCheckout(
  cart: unknown,
  method: DeliveryMethod,
): Promise<CheckoutQuote | { error: string }> {
  const parsed = cartSchema.safeParse(cart)
  if (!parsed.success || !DELIVERY_METHODS.includes(method)) return { error: 'Your cart is empty' }
  const q = await priceCart(parsed.data, method)
  return {
    lines: q.lines.map((l) => ({
      key: `${l.artworkId}:${l.type}:${l.size ?? ''}`,
      title: l.title,
      image: l.image,
      label: l.type === 'print' ? `${l.label} · × ${l.qty}` : l.label,
      qty: l.qty,
      lineTotal: l.unitPrice * l.qty,
    })),
    problems: q.problems.map((p) => p.message),
    subtotal: q.subtotal,
    shipping: q.shipping,
    shippingLabel: q.shippingLabel,
    total: q.total,
    rates: {
      courier: {
        ...q.rates.courier,
        label: q.rates.courier.label ?? '',
        price: q.rates.courier.price ?? null,
      },
      collect: {
        ...q.rates.collect,
        label: q.rates.collect.label ?? '',
        price: q.rates.collect.price ?? null,
      },
      international: {
        ...q.rates.international,
        label: q.rates.international.label ?? '',
        price: q.rates.international.price ?? null,
      },
    },
  }
}

export type PlaceOrderState = {
  status: 'idle' | 'error' | 'redirect'
  message?: string
  errors?: Record<string, string>
  redirect?: PayfastRedirect
}

const str = (f: FormData, k: string) => String(f.get(k) ?? '')

/**
 * Checks everything again on the server, reserves originals, creates the pending order and
 * returns the signed PayFast form for the browser to submit.
 */
export async function placeOrder(_prev: PlaceOrderState, form: FormData): Promise<PlaceOrderState> {
  let cart: unknown
  try {
    cart = JSON.parse(str(form, 'cart'))
  } catch {
    cart = null
  }
  const parsedCart = cartSchema.safeParse(cart)
  if (!parsedCart.success) return { status: 'error', message: 'Your cart is empty.' }

  const method = str(form, 'method')
  const parsed = checkoutSchema.safeParse({
    method,
    firstName: str(form, 'firstName'),
    lastName: str(form, 'lastName'),
    email: str(form, 'email'),
    phone: str(form, 'phone'),
    notes: str(form, 'notes'),
    gift: form.get('gift') === 'on',
    ...(method !== 'collect' && {
      address: {
        line1: str(form, 'line1'),
        suburb: str(form, 'suburb'),
        city: str(form, 'city'),
        province: str(form, 'province'),
        postalCode: str(form, 'postalCode'),
        country:
          method === 'courier'
            ? 'South Africa'
            : str(form, 'country') === 'Other'
              ? str(form, 'countryOther')
              : str(form, 'country'),
      },
    }),
  })
  if (!parsed.success) {
    const errors = flattenErrors(parsed.error)
    return { status: 'error', errors, message: 'Please check the details marked below.' }
  }

  const input = parsed.data
  const quote = await priceCart(parsedCart.data, input.method)
  if (quote.problems.length)
    return { status: 'error', message: quote.problems.map((p) => p.message).join(' ') }
  if (quote.total === null)
    return {
      status: 'error',
      message:
        'Shipping for this option is still being worked out. Please choose another, or ask Lara.',
    }
  if (quote.total <= 0) return { status: 'error', message: 'Your cart is empty.' }

  if (!payfastConfig().configured) {
    return {
      status: 'error',
      message: "Payments aren't switched on just yet. Please check back soon, or send Lara a note.",
    }
  }

  const orderId = newOrderId()
  const reference = await nextReference()
  try {
    await createPendingOrder({
      orderId,
      reference,
      input,
      lines: quote.lines,
      subtotal: quote.subtotal,
      shipping: quote.shipping ?? 0,
      total: quote.total,
    })
  } catch (error) {
    if (error instanceof ReservationConflict) {
      return {
        status: 'error',
        message: 'Someone else has just reserved one of these originals. Please check your cart.',
      }
    }
    console.error('[checkout] could not create order', error)
    return {
      status: 'error',
      message: 'Something went wrong on our side. Nothing was charged; please try again.',
    }
  }
  if (quote.lines.some((l) => l.type === 'original')) revalidateTag('artwork', { expire: 0 })

  return {
    status: 'redirect',
    redirect: buildPayfastRedirect({
      orderId,
      reference,
      totalCents: quote.total,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      siteUrl: siteUrl(),
    }),
  }
}

/** The shopper came back from PayFast's cancel button: free their reservation straight away */
export async function cancelledAtPayfast(orderId: string) {
  if (!isOrderId(orderId)) return
  if (await closeUnpaidOrder(orderId, 'cancelled')) revalidateTag('artwork', { expire: 0 })
}

/** Polled by the order page while it waits for PayFast's notification */
export async function orderStatus(orderId: string) {
  const order = await getOrder(orderId)
  return order?.status ?? null
}

function flattenErrors(error: z.ZodError): Record<string, string> {
  const out = fieldErrors(error)
  for (const issue of error.issues) {
    if (issue.path[0] === 'address' && issue.path[1]) out[String(issue.path[1])] ??= issue.message
  }
  return out
}
