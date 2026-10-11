import type { Metadata, Viewport } from 'next'
import { fontVariables } from './fonts'

// Global site CSS is imported by the (site) layout, not here, so the embedded
// Sanity Studio at /studio isn't affected by the site's base styles.

export const metadata: Metadata = {
  title: { default: 'Lara Berge Artworks', template: '%s · Lara Berge Artworks' },
  description: 'Original oil paintings, signed fine art prints and commissions by Lara Berge.',
}

export const viewport: Viewport = {
  themeColor: '#F6F2EA',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-ZA" className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}
