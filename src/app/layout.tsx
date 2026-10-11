import type { Metadata, Viewport } from 'next'
import { fontVariables } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lara Berge Artworks',
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
