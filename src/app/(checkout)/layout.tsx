import '../globals.css'
import Link from 'next/link'
import { LockIcon } from '@/components/icons'
import { Logo } from '@/components/header/Logo'
import { CartHydrator } from '@/lib/cart/CartHydrator'

/** Checkout gets a quiet bar instead of the full header, as in the design. */
export default function CheckoutLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="min-h-dvh text-lg leading-[1.55]">
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-[18px] md:px-6">
          <Link
            href="/shop"
            className="inline-flex min-h-11 flex-1 items-center text-[15px] text-mauve md:text-base"
          >
            ← back to the shop
          </Link>
          <Link href="/" aria-label="Lara Berge Artworks, home" className="block flex-none">
            <Logo size="checkout" />
          </Link>
          <span className="flex flex-1 items-center justify-end gap-2 text-sm text-ink-soft md:text-[15px]">
            <LockIcon /> <span className="max-sm:sr-only">Secure checkout</span>
          </span>
        </div>
      </header>
      <main id="main">{children}</main>
      <CartHydrator />
    </div>
  )
}
