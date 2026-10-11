'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArtImage } from '@/components/ArtImage'
import { ButtonLink, TextLink } from '@/components/Button'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '@/components/icons'
import { cx } from '@/lib/cx'
import { imageProps } from '@/sanity/image'
import type { SanityImg } from '@/sanity/types'

export type LightboxItem = {
  slug: string
  title: string
  image: SanityImg
  medium?: string
  year?: number
  kind: 'painting' | 'digital'
  hasPrints: boolean
}

type LightboxProps = {
  items: LightboxItem[]
  startIndex: number
  /**
   * `modal`: opened over the gallery (intercepted route); closing goes back.
   * `page`: a direct visit to /gallery/[slug]; closing goes to the gallery.
   */
  mode: 'modal' | 'page'
}

const SWIPE_PX = 50

/** Full-screen artwork viewer: prev/next, arrow keys, Escape, swipe, and a shareable URL. */
export function Lightbox({ items, startIndex, mode }: LightboxProps) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState(startIndex)
  const touchX = useRef<number | null>(null)
  const item = items[index]
  const n = items.length
  const galleryHref = item.kind === 'digital' ? '/gallery?tab=digital' : '/gallery'

  const go = useCallback((delta: number) => setIndex((i) => (((i + delta) % n) + n) % n), [n])

  const close = useCallback(() => {
    if (mode === 'modal') router.back()
    else router.push(galleryHref)
  }, [mode, router, galleryHref])

  // Open as a true modal so the page behind is inert and focus stays inside. When Next hides
  // this route on navigation (it keeps recent routes mounted), the cleanup closes the dialog,
  // and it reopens as a modal if the route is shown again.
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.matches(':modal')) {
      if (dialog.open) dialog.close()
      dialog.showModal()
    }
    const root = document.documentElement
    root.style.overflow = 'hidden'
    return () => {
      dialog.close()
      root.style.overflow = ''
    }
  }, [])

  // Keep the address bar on the piece being shown, without a navigation
  useEffect(() => {
    const path = `/gallery/${items[index].slug}`
    if (window.location.pathname !== path)
      window.history.replaceState(window.history.state, '', path)
  }, [index, items])

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowRight') go(1)
    else if (event.key === 'ArrowLeft') go(-1)
  }

  const neighbours = n > 1 ? [items[(index + 1) % n], items[(index - 1 + n) % n]] : []
  const medium = item.medium ?? (item.kind === 'digital' ? 'Digital illustration' : 'Oil on canvas')

  return (
    <dialog
      ref={dialogRef}
      aria-label="Artwork viewer"
      onKeyDown={onKeyDown}
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
      className="fixed inset-0 z-50 m-0 flex h-dvh max-h-none w-full max-w-none flex-col border-0 bg-night p-0 font-body text-night-text backdrop:bg-night [&_:focus-visible]:outline-night-accent"
    >
      <div className="flex items-center justify-between px-4 pt-3 md:px-8 md:pt-[22px]">
        <span
          aria-live="polite"
          className="font-sc text-[13px] tracking-[0.2em] text-night-muted md:text-[15px]"
        >
          {item.kind === 'digital' ? 'Digital illustration' : 'Paintings'} · {index + 1} of {n}
          <span className="sr-only">: {item.title}</span>
        </span>
        <button
          type="button"
          onClick={close}
          aria-label="Close viewer"
          className="inline-flex size-12 items-center justify-center rounded-full border-0 bg-transparent text-night-text hover:bg-night-text/10"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-between gap-2 px-2 py-2 md:gap-6 md:px-6">
        {n > 1 && <NavButton direction="prev" onClick={() => go(-1)} />}
        <figure
          className="m-0 flex h-full min-w-0 flex-1 items-center justify-center"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            touchX.current = null
            if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1)
          }}
        >
          <ArtImage
            key={item.slug}
            {...imageProps(item.image)}
            sizes="(min-width: 768px) 75vw, 100vw"
            loading="eager"
            className="block h-auto max-h-[min(640px,calc(100dvh-230px))] w-auto max-w-full animate-show object-contain shadow-viewer"
          />
        </figure>
        {n > 1 && <NavButton direction="next" onClick={() => go(1)} />}
        {/* Warm the cache for the neighbours so prev/next feel instant */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute size-px overflow-hidden opacity-0"
        >
          {neighbours.map((nb) => (
            <ArtImage
              key={nb.slug}
              {...imageProps(nb.image, '')}
              sizes="(min-width: 768px) 75vw, 100vw"
              loading="eager"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-4 pb-5 md:px-8 md:pb-7">
        <div>
          <p className="m-0 font-display text-2xl leading-[1.15] md:text-[30px]">{item.title}</p>
          <p className="mt-0.5 mb-0 text-[15px] text-night-muted md:text-base">
            {medium} · {item.year ?? '[year]'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-[22px] gap-y-3">
          <TextLink href="/commissions" tone="night">
            commission something similar →
          </TextLink>
          {item.hasPrints && (
            <ButtonLink href={`/shop/${item.slug}`} variant="light" className="px-6 text-[19px]">
              Order a print
            </ButtonLink>
          )}
        </div>
      </div>

      {mode === 'page' && (
        <Link href={galleryHref} className="sr-only focus:not-sr-only">
          Back to the gallery
        </Link>
      )}
    </dialog>
  )
}

function NavButton({ direction, onClick }: { direction: 'prev' | 'next'; onClick: () => void }) {
  const Icon = direction === 'prev' ? ChevronLeftIcon : ChevronRightIcon
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous piece' : 'Next piece'}
      className={cx(
        'z-10 flex size-11 shrink-0 items-center justify-center rounded-full border border-night-text/35 bg-night/40 text-night-text transition-colors hover:bg-night-text/10 md:size-14 md:bg-transparent',
        'max-md:absolute max-md:top-1/2 max-md:-translate-y-1/2',
        direction === 'prev' ? 'max-md:left-2' : 'max-md:right-2',
      )}
    >
      <Icon />
    </button>
  )
}
