import '../globals.css'
import { Footer } from '@/components/footer/Footer'
import { Header } from '@/components/header/Header'
import { CartHydrator } from '@/lib/cart/CartHydrator'

export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <a
        href="#main"
        className="sr-only z-50 bg-paper px-4 py-2 font-display text-mauve focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartHydrator />
    </div>
  )
}
