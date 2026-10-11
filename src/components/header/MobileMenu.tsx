'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { CloseIcon, HamburgerIcon } from '@/components/icons'
import { Spider } from '@/components/Spider'
import { brand } from '@/lib/brand'
import { Logo } from './Logo'
import { NavLinks, NavList } from './NavLinks'

type MobileMenuProps = {
  instagramUrl?: string
  instagramHandle?: string
  spiderSrc?: string
}

/**
 * Phone menu: a full-screen modal <dialog>. The browser makes the rest of the page
 * inert while it's open, keeps focus inside, closes it on Escape and hands focus
 * back to the hamburger afterwards.
 */
export function MobileMenu({ instagramUrl, instagramHandle, spiderSrc }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
    const root = document.documentElement
    root.style.overflow = open ? 'hidden' : ''
    return () => {
      root.style.overflow = ''
    }
  }, [open])

  // The phone header disappears from 768px, so don't leave an invisible menu holding the page
  useEffect(() => {
    if (!open) return
    const wide = window.matchMedia('(min-width: 768px)')
    const onChange = (e: MediaQueryListEvent) => e.matches && setOpen(false)
    wide.addEventListener('change', onChange)
    return () => wide.removeEventListener('change', onChange)
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="flex size-12 items-center justify-center border-0 bg-transparent text-ink"
      >
        <HamburgerIcon />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        onClose={close}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none animate-menuin flex-col overflow-y-auto border-0 bg-cream p-0 text-ink backdrop:bg-transparent open:flex"
      >
        <div className="flex items-center justify-between px-3 pt-3.5">
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="flex size-12 items-center justify-center border-0 bg-transparent text-ink"
          >
            <CloseIcon />
          </button>
          <Logo size="menu" />
          <span className="w-12" />
        </div>

        <Spider src={spiderSrc} thread={150} size={30} className="absolute top-0 right-10" />

        <div className="flex flex-1 flex-col justify-center px-9">
          <Suspense fallback={<NavList variant="menu" onNavigate={close} />}>
            <NavLinks variant="menu" onNavigate={close} />
          </Suspense>
          <Link
            href="/commissions"
            onNavigate={close}
            className="mt-[18px] flex min-h-11 items-center font-display text-[21px] text-mauve italic"
          >
            commission a piece →
          </Link>
        </div>

        <div className="flex items-end justify-between px-9 pb-[34px]">
          {instagramUrl ? (
            <a
              href={instagramUrl}
              className="inline-flex min-h-11 items-center text-base text-ink-soft"
              rel="noopener"
            >
              @{instagramHandle ?? '[instagram handle]'}
            </a>
          ) : (
            <span className="inline-flex min-h-11 items-center text-base text-ink-soft">
              @{instagramHandle ?? '[instagram handle]'}
            </span>
          )}
          <Image src={brand.doodads.shroom} alt="" className="h-auto w-[70px]" />
        </div>
      </dialog>
    </>
  )
}
