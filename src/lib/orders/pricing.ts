import { readClient } from '@/sanity/client'
import type { OriginalStatus, PrintSize, SanityImg } from '@/sanity/types'
import type { CartLine } from '@/lib/cart/lines'
import type { DeliveryMethod } from './schema'

type FreshArtwork = {
  _id: string
  _rev: string
  title: string
  slug: string
  kind: 'painting' | 'digital'
  image: SanityImg | null
  original: {
    forSale?: boolean
    price?: number | null
    status?: OriginalStatus
    reservedUntil?: string | null
  } | null
  prints: {
    enabled?: boolean
    variants?: Array<{
      size: PrintSize
      price?: number | null
      active?: boolean
      dimensions?: string
    }>
  } | null
}

type ShippingRate = { label?: string; note?: string; price?: number | null }

export type PricedLine = {
  artworkId: string
  rev: string
  title: string
  slug: string
  image: SanityImg | null
  type: 'original' | 'print'
  size?: PrintSize
  qty: number
  unitPrice: number
  label: string
}

export type Quote = {
  lines: PricedLine[]
  /** Lines that can't be bought, with the reason, so the shopper can fix their cart */
  problems: Array<{ artworkId: string; type: CartLine['type']; size?: PrintSize; message: string }>
  subtotal: number
  shipping: number | null
  shippingLabel: string
  total: number | null
  rates: Record<DeliveryMethod, ShippingRate & { available: boolean }>
}

/** A reservation past its time no longer counts (the cron releases it in the background too) */
export const reservationExpired = (until?: string | null, now = Date.now()) =>
  !until || new Date(until).getTime() <= now

/**
 * Prices a cart from fresh Sanity data. Never cached and never trusts the client: this is
 * what the checkout summary shows and exactly what createOrder charges.
 */
export async function priceCart(cart: CartLine[], method: DeliveryMethod): Promise<Quote> {
  const ids = [...new Set(cart.map((l) => l.artworkId))]
  const { artworks, settings } = await readClient.fetch<{
    artworks: FreshArtwork[]
    settings: Record<
      'shippingCourier' | 'shippingCollect' | 'shippingInternational',
      ShippingRate | null
    > | null
  }>(
    `{
      "artworks": *[_type == "artwork" && _id in $ids]{
        _id, _rev, title, "slug": slug.current, kind,
        "image": mainImage{ "url": asset->url, "lqip": asset->metadata.lqip, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, alt, "hotspot": hotspot{x, y} },
        original{ forSale, price, status, reservedUntil },
        prints{ enabled, variants[]{ size, price, active, dimensions } }
      },
      "settings": *[_id == "siteSettings"][0]{ shippingCourier, shippingCollect, shippingInternational }
    }`,
    { ids },
    { cache: 'no-store' },
  )

  const lines: PricedLine[] = []
  const problems: Quote['problems'] = []
  const fail = (l: CartLine, message: string) =>
    problems.push({ artworkId: l.artworkId, type: l.type, size: l.size, message })

  for (const l of cart) {
    const a = artworks.find((x) => x._id === l.artworkId)
    if (!a) {
      fail(l, 'This piece is no longer available')
      continue
    }
    const base = { artworkId: a._id, rev: a._rev, title: a.title, slug: a.slug, image: a.image }

    if (l.type === 'original') {
      const o = a.original
      if (a.kind !== 'painting' || !o?.forSale)
        fail(l, `${a.title}: the original is no longer for sale`)
      else if (o.status === 'sold') fail(l, `${a.title} has just been sold, sorry`)
      else if (o.status === 'reserved' && !reservationExpired(o.reservedUntil))
        fail(l, `Someone is buying ${a.title} right now. Try again in half an hour?`)
      else if (typeof o.price !== 'number') fail(l, `${a.title} doesn't have a price yet`)
      else
        lines.push({
          ...base,
          type: 'original',
          qty: 1,
          unitPrice: o.price,
          label: 'Original painting',
        })
      continue
    }

    const v = a.prints?.enabled
      ? a.prints.variants?.find((x) => x.size === l.size && x.active !== false)
      : undefined
    if (!v) fail(l, `${a.title}: the ${l.size ?? ''} print is no longer available`)
    else if (typeof v.price !== 'number')
      fail(l, `${a.title}: the ${l.size} print doesn't have a price yet`)
    else
      lines.push({
        ...base,
        type: 'print',
        size: v.size,
        qty: l.qty,
        unitPrice: v.price,
        label: `Signed print · ${v.size}`,
      })
  }

  const rate = (r: ShippingRate | null | undefined, fallbackLabel: string) => ({
    label: r?.label || fallbackLabel,
    note: r?.note,
    price: r?.price ?? null,
    available: typeof r?.price === 'number',
  })
  const rates = {
    courier: rate(settings?.shippingCourier, 'Courier, door to door'),
    collect: {
      ...rate(settings?.shippingCollect, 'Collect from the studio'),
      price: 0,
      available: true,
    },
    international: rate(settings?.shippingInternational, 'International shipping'),
  }

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0)
  const shipping = rates[method].available ? (rates[method].price ?? 0) : null
  return {
    lines,
    problems,
    subtotal,
    shipping,
    shippingLabel: method === 'collect' ? 'Collection' : 'Shipping',
    total: shipping === null ? null : subtotal + shipping,
    rates,
  }
}
