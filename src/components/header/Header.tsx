import Link from 'next/link'
import { Suspense } from 'react'
import { Spider } from '@/components/Spider'
import { CartButton } from './CartButton'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { NavLinks, NavList } from './NavLinks'

type HeaderProps = {
  instagramUrl?: string
  instagramHandle?: string
  /** Lara's spider drawing, once she sends it */
  spiderSrc?: string
  /** Hide the spider (it can be switched off in the designs) */
  spider?: boolean
}

/**
 * Site header. From 768px: centred hand-lettered logo, text nav underneath, cart top right,
 * spider dangling top right. Below 768px: hamburger, logo, cart.
 */
export function Header({ instagramUrl, instagramHandle, spiderSrc, spider = true }: HeaderProps) {
  return (
    <header className="relative w-full bg-cream">
      {/* Phone */}
      <div className="flex items-center justify-between px-3 pt-3.5 pb-2 md:hidden">
        <MobileMenu
          instagramUrl={instagramUrl}
          instagramHandle={instagramHandle}
          spiderSrc={spiderSrc}
        />
        <Link href="/" aria-label="Lara Berge Artworks, home" className="text-ink">
          <Logo size="compact" />
        </Link>
        <CartButton compact />
      </div>

      {/* Tablet and up */}
      {spider && (
        <Spider
          src={spiderSrc}
          thread={128}
          size={34}
          className="absolute top-0 right-[9%] max-md:hidden"
        />
      )}
      <div className="relative mx-auto flex max-w-[1360px] flex-col items-center gap-3 px-6 pt-8 pb-2 max-md:hidden">
        <Link href="/" aria-label="Lara Berge Artworks, home" className="text-ink">
          <Logo size="header" />
        </Link>
        <Suspense fallback={<NavList variant="bar" />}>
          <NavLinks variant="bar" />
        </Suspense>
        <CartButton className="absolute top-9 right-6" />
      </div>
    </header>
  )
}
