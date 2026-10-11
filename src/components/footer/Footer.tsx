import { cacheLife } from 'next/cache'
import Link from 'next/link'
import { Suspense } from 'react'
import { InstagramIcon, MailIcon } from '@/components/icons'
import { FooterCat } from './FooterCat'

const LINKS = [
  { label: 'Commissions', href: '/commissions' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Shipping & returns', href: '/faq#shipping' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
]

async function CopyrightYear() {
  'use cache'
  cacheLife('days')
  return <>{new Date().getFullYear()}</>
}

type FooterProps = {
  /**
   * `route` (default) shows the sitting cat except on pages whose designs leave it off.
   * `true`/`false` force it on or off.
   */
  cat?: boolean | 'route'
  instagramUrl?: string
}

export function Footer({ cat = 'route', instagramUrl }: FooterProps) {
  return (
    <footer className="w-full bg-cream pt-[90px] text-muted md:pt-[120px]">
      <div className="relative mx-auto max-w-[1120px] px-[22px] pb-8 md:px-6 md:pb-10">
        {cat !== false && (
          <Suspense fallback={null}>
            <FooterCat alwaysShow={cat === true} />
          </Suspense>
        )}
        <div className="flex flex-col gap-3 border-t border-rule pt-[22px] text-[15px] md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4 md:pt-[30px] md:text-base">
          <span className="order-2 font-display md:order-1">
            © <CopyrightYear /> Lara Berge Artworks
          </span>
          <nav
            aria-label="Footer"
            className="order-1 flex flex-wrap gap-x-5 md:order-2 md:gap-x-6 md:gap-y-1"
          >
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center text-muted hover:text-mauve"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="order-3 -ml-3 flex gap-1 md:ml-0">
            {instagramUrl && (
              <a
                href={instagramUrl}
                aria-label="Instagram"
                rel="noopener"
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted hover:text-mauve"
              >
                <InstagramIcon />
              </a>
            )}
            <Link
              href="/contact"
              aria-label="Email Lara"
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted hover:text-mauve"
            >
              <MailIcon />
            </Link>
          </div>
        </div>
        <p className="mt-[18px] mb-0 text-sm text-muted">
          Secure payments by PayFast · card, Instant EFT &amp; SnapScan · Shipped from South Africa
        </p>
      </div>
    </footer>
  )
}
