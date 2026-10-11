import type { ArtworkCard } from '@/sanity/types'
import { formatZAR } from './format'

const price = (cents: number | null | undefined) =>
  typeof cents === 'number' ? formatZAR(cents) : 'R[price]'

/** The original exists, is for sale, and nobody has bought or reserved it */
export const originalAvailable = (a: Pick<ArtworkCard, 'original'>) =>
  !!a.original?.forSale && (a.original.status ?? 'available') === 'available'

export const originalSold = (a: Pick<ArtworkCard, 'original'>) =>
  !!a.original?.forSale && a.original.status === 'sold'

/** Card meta line, e.g. "Original R4 500 · prints available" or "Digital · prints from R850" */
export function cardStatus(a: ArtworkCard): { text: string; italic?: string } {
  if (a.kind === 'digital') {
    return {
      text: a.hasPrints ? `Digital · prints from ${price(a.printsFrom)}` : 'Digital illustration',
    }
  }
  const prints = a.hasPrints ? ' · prints available' : ''
  if (!a.original?.forSale) return { text: a.hasPrints ? 'Prints available' : 'Oil painting' }
  if (a.original.status === 'sold') return { italic: 'Original sold', text: prints }
  if (a.original.status === 'reserved') return { italic: 'Original reserved', text: prints }
  return { text: `Original ${price(a.original.price)}${prints}` }
}

/** Short link text on gallery paintings, e.g. "Original available" or "Sold · prints" */
export function galleryStatus(a: ArtworkCard): string {
  if (originalSold(a)) return a.hasPrints ? 'Sold · prints' : 'Sold'
  if (a.original?.status === 'reserved') return 'Reserved'
  if (originalAvailable(a)) return 'Original available'
  return a.hasPrints ? 'Prints available' : 'See it'
}

/** Settings text, or the [bracketed] placeholder from the designs while Lara hasn't filled it in */
export const or = (value: string | null | undefined, placeholder: string) =>
  value && value.trim() ? value : placeholder
