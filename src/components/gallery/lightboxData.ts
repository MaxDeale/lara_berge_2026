import { notFound } from 'next/navigation'
import { getArtworks } from '@/sanity/queries'
import type { LightboxItem } from './Lightbox'

/** The collection a piece belongs to, in gallery order, and where it sits in it */
export async function getLightboxCollection(slug: string) {
  const artworks = await getArtworks()
  const current = artworks.find((a) => a.slug === slug)
  if (!current) notFound()
  const items: LightboxItem[] = artworks
    .filter((a) => a.kind === current.kind)
    .map(({ slug, title, image, medium, year, kind, hasPrints }) => ({
      slug,
      title,
      image,
      medium,
      year,
      kind,
      hasPrints,
    }))
  return { items, index: items.findIndex((i) => i.slug === slug), current }
}

export async function lightboxStaticParams() {
  const artworks = await getArtworks()
  return artworks.map((a) => ({ slug: a.slug }))
}
