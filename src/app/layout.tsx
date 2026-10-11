import type { Metadata, Viewport } from 'next'
import { preconnect } from 'react-dom'
import { ogImage } from '@/lib/seo'
import { SITE_NAME, siteUrl } from '@/lib/site'
import { getSettings } from '@/sanity/queries'
import { fontVariables } from './fonts'

// Global site CSS is imported by the (site) layout, not here, so the embedded
// Sanity Studio at /studio isn't affected by the site's base styles.

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  const description =
    s.seoDescription ??
    'Original oil paintings, signed fine art prints and commissions by Lara Berge.'
  const image = ogImage(s.seoImage ?? s.heroArtwork?.image)
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.seoTitle ?? SITE_NAME, template: `%s · ${SITE_NAME}` },
    description,
    applicationName: SITE_NAME,
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_ZA',
      description,
      ...(image && { images: [image] }),
    },
    twitter: { card: 'summary_large_image' },
  }
}

export const viewport: Viewport = {
  themeColor: '#F6F2EA',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  // Artwork comes from Sanity's image CDN: open the connection while the HTML is still arriving
  preconnect('https://cdn.sanity.io', { crossOrigin: 'anonymous' })
  return (
    <html lang="en-ZA" className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}
