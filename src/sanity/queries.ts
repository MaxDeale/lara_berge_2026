import { defineQuery } from 'next-sanity'
import { SHOW_PAINTINGS } from '@/lib/site'
import { sanityFetch } from './client'
import type { ArtworkCard, ArtworkDetail, CatalogItem, FaqItem, LegalPage, Settings } from './types'

const IMG = `{
  "url": asset->url,
  "lqip": asset->metadata.lqip,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  alt,
  "hotspot": hotspot{x, y}
}`

const CARD = `
  _id,
  title,
  "slug": slug.current,
  kind,
  year,
  medium,
  dimensions,
  "featured": featured == true,
  "image": mainImage${IMG},
  "original": select(kind == "painting" => original{forSale, price, status}, null),
  "hasPrints": prints.enabled == true && count(prints.variants[active != false]) > 0,
  "printsFrom": math::min(prints.variants[active != false && defined(price)].price)
`

// $paintings is SHOW_PAINTINGS: while it's false, oil paintings are left out of every list
const LISTED = `_type == "artwork" && defined(slug.current) && defined(mainImage.asset) && ($paintings || kind != "painting")`

/** A Settings picture taken from an artwork, or null while that artwork is a hidden painting */
const artImage = (ref: string) =>
  `select($paintings || ${ref}->kind != "painting" => ${ref}->mainImage${IMG})`

export const ARTWORKS_QUERY = defineQuery(`*[${LISTED}] | order(orderRank) { ${CARD} }`)

export const ARTWORK_QUERY = defineQuery(`*[${LISTED} && slug.current == $slug][0] {
  ${CARD},
  description,
  "detailImages": detailImages[]{ ...${IMG}, label },
  "variants": select(
    prints.enabled == true => prints.variants[active != false]{ size, dimensions, price },
    []
  )
}`)

/** Everything the cart drawer needs to show a line. Display only: checkout re-prices on the server. */
export const CATALOG_QUERY = defineQuery(`*[${LISTED}] {
  _id,
  title,
  "slug": slug.current,
  kind,
  dimensions,
  "image": mainImage${IMG},
  "original": select(kind == "painting" => original{forSale, price, status}, null),
  "variants": select(
    prints.enabled == true => prints.variants[active != false]{ size, dimensions, price },
    []
  )
}`)

export const SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0] {
  ...,
  "heroArtwork": select($paintings || heroArtwork->kind != "painting" => heroArtwork->{ ${CARD} }),
  "portrait": portrait${IMG},
  "aboutPhoto": aboutPhoto${IMG},
  "shopOriginalsImage": ${artImage('shopOriginalsArtwork')},
  "shopPrintsImage": ${artImage('shopPrintsArtwork')},
  "shopCommissionsImage": ${artImage('shopCommissionsArtwork')},
  "commissionOilImage": ${artImage('commissionOilArtwork')},
  "commissionDigitalImage": ${artImage('commissionDigitalArtwork')},
  "seoImage": seoImage${IMG}
}`)

export const FAQ_QUERY = defineQuery(
  `*[_type == "faqItem" && showOn in $showOn] | order(orderRank) { _id, question, answer, section }`,
)

export const LEGAL_QUERY = defineQuery(
  `*[_type == "legalPage" && slug.current == $slug][0] { title, body }`,
)

const shown = { paintings: SHOW_PAINTINGS }

export const getArtworks = () => sanityFetch<ArtworkCard[]>(ARTWORKS_QUERY, shown, ['artwork'])

export const getCatalog = () => sanityFetch<CatalogItem[]>(CATALOG_QUERY, shown, ['artwork'])

export const getArtwork = (slug: string) =>
  sanityFetch<ArtworkDetail | null>(ARTWORK_QUERY, { ...shown, slug }, ['artwork'])

export const getSettings = async () =>
  (await sanityFetch<Settings | null>(SETTINGS_QUERY, shown, ['siteSettings', 'artwork'])) ?? {}

export const getFaq = (page: 'faq' | 'commissions') =>
  sanityFetch<FaqItem[]>(FAQ_QUERY, { showOn: [page, 'both'] }, ['faqItem'])

export const getLegalPage = (slug: 'terms' | 'privacy') =>
  sanityFetch<LegalPage | null>(LEGAL_QUERY, { slug }, ['legalPage'])
