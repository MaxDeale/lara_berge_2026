import { defineQuery } from 'next-sanity'
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

const LISTED = `_type == "artwork" && defined(slug.current) && defined(mainImage.asset)`

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
  "heroArtwork": heroArtwork->{ ${CARD} },
  "portrait": portrait${IMG},
  "aboutPhoto": aboutPhoto${IMG},
  "shopOriginalsImage": shopOriginalsArtwork->mainImage${IMG},
  "shopPrintsImage": shopPrintsArtwork->mainImage${IMG},
  "shopCommissionsImage": shopCommissionsArtwork->mainImage${IMG},
  "commissionOilImage": commissionOilArtwork->mainImage${IMG},
  "commissionDigitalImage": commissionDigitalArtwork->mainImage${IMG},
  "seoImage": seoImage${IMG}
}`)

export const FAQ_QUERY = defineQuery(
  `*[_type == "faqItem" && showOn in $showOn] | order(orderRank) { _id, question, answer, section }`,
)

export const LEGAL_QUERY = defineQuery(
  `*[_type == "legalPage" && slug.current == $slug][0] { title, body }`,
)

export const getArtworks = () => sanityFetch<ArtworkCard[]>(ARTWORKS_QUERY, {}, ['artwork'])

export const getCatalog = () => sanityFetch<CatalogItem[]>(CATALOG_QUERY, {}, ['artwork'])

export const getArtwork = (slug: string) =>
  sanityFetch<ArtworkDetail | null>(ARTWORK_QUERY, { slug }, ['artwork'])

export const getSettings = async () =>
  (await sanityFetch<Settings | null>(SETTINGS_QUERY, {}, ['siteSettings', 'artwork'])) ?? {}

export const getFaq = (page: 'faq' | 'commissions') =>
  sanityFetch<FaqItem[]>(FAQ_QUERY, { showOn: [page, 'both'] }, ['faqItem'])

export const getLegalPage = (slug: 'terms' | 'privacy') =>
  sanityFetch<LegalPage | null>(LEGAL_QUERY, { slug }, ['legalPage'])
