import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lara Berge Artworks',
  description: 'Original oil paintings, signed fine art prints and commissions by Lara Berge.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-ZA">
      <body>{children}</body>
    </html>
  )
}
