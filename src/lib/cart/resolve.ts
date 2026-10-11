import type { CatalogItem, SanityImg } from '@/sanity/types'
import type { CartLine } from './lines'

export type ResolvedLine = {
  line: CartLine
  title: string
  slug?: string
  image?: SanityImg
  /** e.g. "Original oil painting · 40 × 50 cm" or "Signed print · A3" */
  label: string
  unitPrice: number | null
  /** Why it can't be bought right now, if it can't */
  problem?: string
}

/** Matches a cart line to the catalog for display. Never used for charging: checkout re-prices. */
export function resolveLine(line: CartLine, catalog: CatalogItem[]): ResolvedLine {
  const art = catalog.find((a) => a._id === line.artworkId)
  if (!art) {
    return {
      line,
      title: 'A piece that is no longer listed',
      label: '',
      unitPrice: null,
      problem: 'No longer available',
    }
  }
  const base = { line, title: art.title, slug: art.slug, image: art.image }

  if (line.type === 'original') {
    const o = art.original
    const label = `Original oil painting · ${art.dimensions ?? '[W × H cm]'}`
    if (!o?.forSale) return { ...base, label, unitPrice: null, problem: 'No longer for sale' }
    if (o.status === 'sold')
      return { ...base, label, unitPrice: o.price ?? null, problem: 'Sold, sorry' }
    if (o.status === 'reserved') {
      return {
        ...base,
        label,
        unitPrice: o.price ?? null,
        problem: 'Someone is buying this right now',
      }
    }
    return {
      ...base,
      label,
      unitPrice: o.price ?? null,
      problem: o.price == null ? 'Price coming soon' : undefined,
    }
  }

  const variant = art.variants.find((v) => v.size === line.size)
  const label = `Signed print · ${line.size ?? ''}`
  if (!variant)
    return { ...base, label, unitPrice: null, problem: 'This size is no longer available' }
  return {
    ...base,
    label,
    unitPrice: variant.price ?? null,
    problem: variant.price == null ? 'Price coming soon' : undefined,
  }
}

export function subtotal(lines: ResolvedLine[]): number | null {
  let total = 0
  for (const l of lines) {
    if (l.unitPrice == null) return null
    total += l.unitPrice * l.line.qty
  }
  return total
}
