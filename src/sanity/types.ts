import type { PortableTextBlock } from 'next-sanity'

export type SanityImg = {
  url: string
  lqip?: string
  width: number
  height: number
  alt?: string
  hotspot?: { x: number; y: number }
}

export type PrintSize = 'A4' | 'A3' | 'A2'
export type OriginalStatus = 'available' | 'reserved' | 'sold'

export type PrintVariant = {
  size: PrintSize
  dimensions?: string
  price?: number | null
}

/** What lists and cards need */
export type ArtworkCard = {
  _id: string
  title: string
  slug: string
  kind: 'painting' | 'digital'
  year?: number
  medium?: string
  dimensions?: string
  featured: boolean
  image: SanityImg
  original?: { forSale?: boolean; price?: number | null; status?: OriginalStatus } | null
  hasPrints: boolean
  printsFrom?: number | null
}

/** The full product page */
export type ArtworkDetail = ArtworkCard & {
  description?: PortableTextBlock[]
  detailImages?: Array<SanityImg & { label?: string }>
  variants: PrintVariant[]
}

export type ShippingRate = { label?: string; note?: string; price?: number | null }

export type StudioNote = { label?: string; text?: string }

export type Settings = {
  heroArtwork?: ArtworkCard | null
  heroMotion?: 'drift-fireflies' | 'drift' | 'still'
  introHeading?: string
  introHeadingItalic?: string
  introText?: string
  helloText?: string[]
  portrait?: SanityImg | null

  aboutEyebrow?: string
  aboutHeading?: string
  aboutBody?: PortableTextBlock[]
  aboutPhoto?: SanityImg | null
  aboutPhotoCaption?: string
  studioNotes?: StudioNote[]

  shopOriginalsImage?: SanityImg | null
  shopPrintsImage?: SanityImg | null
  shopCommissionsImage?: SanityImg | null
  commissionOilImage?: SanityImg | null
  commissionDigitalImage?: SanityImg | null

  shippingCourier?: ShippingRate
  shippingCollect?: ShippingRate
  shippingInternational?: ShippingRate
  collectionArea?: string
  dispatchOriginals?: string
  dispatchPrints?: string
  deliverySA?: string
  deliveryInternational?: string

  printPaperName?: string
  printPaperDetails?: string
  printLightfast?: string

  commissionOilFrom?: number | null
  commissionDigitalFrom?: number | null
  commissionOilTurnaround?: string
  commissionDigitalTurnaround?: string
  commissionOilSizes?: string
  commissionDigitalRounds?: string
  commissionDepositPercent?: number | null
  commissionReplyDays?: string
  commissionOilSizeOptions?: string[]
  commissionBudgetOptions?: string[]

  contactEmail?: string
  instagramHandle?: string
  replyTime?: string
  city?: string

  seoTitle?: string
  seoDescription?: string
  seoImage?: SanityImg | null
}

export type FaqItem = {
  _id: string
  question: string
  answer?: PortableTextBlock[]
  section: 'shipping' | 'art' | 'commissions' | 'payments'
}

export type LegalPage = { title: string; body?: PortableTextBlock[] }
