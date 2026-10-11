import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'
import { getArtworks } from '@/sanity/queries'

const PAGES = [
  '',
  '/gallery',
  '/shop',
  '/shop/originals',
  '/shop/prints',
  '/commissions',
  '/about',
  '/contact',
  '/faq',
  '/terms',
  '/privacy',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const artworks = await getArtworks()
  return [
    ...PAGES.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
    })),
    ...artworks.map((a) => ({
      url: `${base}/shop/${a.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: [a.image.url],
    })),
  ]
}
