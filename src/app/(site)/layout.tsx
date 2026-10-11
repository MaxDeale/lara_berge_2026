import '../globals.css'
import { Suspense } from 'react'
import { Footer } from '@/components/footer/Footer'
import { Header } from '@/components/header/Header'
import { CartHydrator } from '@/lib/cart/CartHydrator'
import { instagramUrl } from '@/lib/site'
import { getSettings } from '@/sanity/queries'

export default async function SiteLayout({ children, modal }: LayoutProps<'/'>) {
  const settings = await getSettings()
  const instagram = instagramUrl(settings.instagramHandle)
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <a
        href="#main"
        className="sr-only z-50 bg-paper px-4 py-2 font-display text-mauve focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <Header instagramUrl={instagram} instagramHandle={settings.instagramHandle} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer instagramUrl={instagram} />
      {/* The lightbox depends on the URL, so it streams in rather than blocking the shell */}
      <Suspense fallback={null}>{modal}</Suspense>
      <CartHydrator />
    </div>
  )
}
