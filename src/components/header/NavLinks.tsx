'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cx } from '@/lib/cx'
import { isActive, MAIN_NAV } from './nav'

type NavLinksProps = {
  variant: 'bar' | 'menu'
  onNavigate?: () => void
  /** Static fallback rendered while the pathname is unknown (dynamic routes during prerender) */
  pathname?: string | null
}

export function NavList({ variant, onNavigate, pathname = null }: NavLinksProps) {
  return (
    <nav
      aria-label="Main"
      className={cx(
        variant === 'bar' &&
          'flex flex-wrap items-center justify-center gap-x-[34px] gap-y-1 font-display text-[23px]',
        variant === 'menu' && 'flex flex-col gap-1.5 font-display',
      )}
    >
      {MAIN_NAV.map((item) => {
        const active = isActive(item, pathname)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            onNavigate={onNavigate}
            className={cx(
              variant === 'bar' && 'swash px-0.5 py-2.5 text-ink',
              variant === 'menu' &&
                cx(
                  'flex min-h-14 items-center text-[42px] leading-[1.2]',
                  active ? 'text-mauve' : 'text-ink',
                ),
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

/** Main nav with the current page marked. Wrap in <Suspense fallback={<NavList …/>}>. */
export function NavLinks(props: Omit<NavLinksProps, 'pathname'>) {
  const pathname = usePathname()
  return <NavList {...props} pathname={pathname} />
}
