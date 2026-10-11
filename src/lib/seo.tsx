import type { ArtworkDetail, SanityImg, Settings } from '@/sanity/types'
import { SITE_NAME, instagramUrl, siteUrl } from './site'

/** A 1200×630 share image from a Sanity image, cropped around Lara's focal point */
export function ogImage(img: SanityImg | null | undefined) {
  if (!img) return undefined
  const url = new URL(img.url)
  url.searchParams.set('w', '1200')
  url.searchParams.set('h', '630')
  url.searchParams.set('fit', 'crop')
  url.searchParams.set('auto', 'format')
  if (img.hotspot) {
    url.searchParams.set('crop', 'focalpoint')
    url.searchParams.set('fp-x', String(img.hotspot.x))
    url.searchParams.set('fp-y', String(img.hotspot.y))
  }
  return { url: url.toString(), width: 1200, height: 630, alt: img.alt ?? SITE_NAME }
}

const availability = (status?: string) =>
  status === 'sold'
    ? 'https://schema.org/SoldOut'
    : status === 'reserved'
      ? 'https://schema.org/LimitedAvailability'
      : 'https://schema.org/InStock'

/** VisualArtwork + Product with ZAR offers for the original and the prints */
export function artworkJsonLd(a: ArtworkDetail) {
  const url = `${siteUrl()}/shop/${a.slug}`
  const offers: object[] = []
  if (a.kind === 'painting' && a.original?.forSale && typeof a.original.price === 'number') {
    offers.push({
      '@type': 'Offer',
      name: 'Original painting',
      price: (a.original.price / 100).toFixed(2),
      priceCurrency: 'ZAR',
      availability: availability(a.original.status),
      itemCondition: 'https://schema.org/NewCondition',
      url,
    })
  }
  const printPrices = a.variants.flatMap((v) => (typeof v.price === 'number' ? [v.price] : []))
  if (printPrices.length) {
    offers.push({
      '@type': 'AggregateOffer',
      name: 'Signed fine art print',
      lowPrice: (Math.min(...printPrices) / 100).toFixed(2),
      highPrice: (Math.max(...printPrices) / 100).toFixed(2),
      offerCount: printPrices.length,
      priceCurrency: 'ZAR',
      availability: 'https://schema.org/InStock',
      url,
    })
  }
  return {
    '@context': 'https://schema.org',
    '@type': offers.length ? ['VisualArtwork', 'Product'] : 'VisualArtwork',
    name: a.title,
    url,
    image: a.image.url,
    description: a.image.alt,
    artform: a.kind === 'painting' ? 'Painting' : 'Digital illustration',
    artMedium: a.medium,
    ...(a.year && { dateCreated: String(a.year) }),
    creator: { '@type': 'Person', name: 'Lara Berge', url: `${siteUrl()}/about` },
    ...(offers.length && { brand: { '@type': 'Brand', name: SITE_NAME }, offers }),
  }
}

export function personJsonLd(s: Settings) {
  const insta = instagramUrl(s.instagramHandle)
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Lara Berge',
    jobTitle: 'Painter and illustrator',
    url: `${siteUrl()}/about`,
    ...(s.aboutPhoto && { image: s.aboutPhoto.url }),
    ...(insta && { sameAs: [insta] }),
    ...(s.city &&
      !s.city.includes('[') && {
        address: { '@type': 'PostalAddress', addressLocality: s.city, addressCountry: 'ZA' },
      }),
  }
}

/** Renders structured data. `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
