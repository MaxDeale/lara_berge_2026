'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ArtImage } from '@/components/ArtImage'
import { buttonClasses } from '@/components/Button'
import { CloseIcon } from '@/components/icons'
import { PriceTag } from '@/components/PriceTag'
import { brand } from '@/lib/brand'
import { lineKey, MAX_PRINT_QTY } from '@/lib/cart/lines'
import { resolveLine, subtotal } from '@/lib/cart/resolve'
import { selectCount, useCart } from '@/lib/cart/store'
import { cx } from '@/lib/cx'
import { imageProps, objectPosition } from '@/sanity/image'
import type { CatalogItem } from '@/sanity/types'

/** Slide-in cart, opened from the header and after Add to cart. */
export function CartDrawer({ catalog }: { catalog: CatalogItem[] }) {
  const open = useCart((s) => s.drawerOpen)
  const close = useCart((s) => s.closeDrawer)
  const lines = useCart((s) => s.lines)
  const count = useCart(selectCount)
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
    document.documentElement.style.overflow = open ? 'hidden' : ''
  }, [open])

  const resolved = lines.map((l) => resolveLine(l, catalog))
  const total = subtotal(resolved)
  const blocked = resolved.some((r) => r.problem)

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="cart-h"
      onClose={close}
      onClick={(e) => {
        // A click on the dimmed backdrop (the dialog itself, outside the panel) closes it
        if (e.target === e.currentTarget) close()
      }}
      className="fixed inset-0 m-0 ml-auto h-dvh max-h-none w-[460px] max-w-full border-0 bg-cream p-0 text-ink shadow-drawer backdrop:bg-[rgba(35,30,27,0.45)] open:flex open:animate-slidein"
    >
      <div className="flex min-h-0 w-full flex-col">
        <div className="flex items-center justify-between border-b border-hairline px-5 pt-[26px] pb-[18px] md:px-7">
          <h2 id="cart-h" className="m-0 font-display text-[28px] font-normal md:text-[32px]">
            Your cart <span className="text-xl text-muted">({count})</span>
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="inline-flex size-11 items-center justify-center border-0 bg-transparent text-ink"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2 md:px-7">
          {resolved.length === 0 ? (
            <div className="px-2.5 py-[60px] text-center">
              <Image src={brand.doodads.galCat} alt="" className="mx-auto h-auto w-[110px]" />
              <p className="mt-3.5 mb-1.5 font-display text-2xl">Your cart is empty</p>
              <Link href="/shop" onNavigate={close} className="text-mauve italic">
                wander the shop →
              </Link>
            </div>
          ) : (
            <ul className="m-0 list-none p-0">
              {resolved.map((r) => {
                const key = lineKey(r.line)
                return (
                  <li key={key} className="flex gap-[18px] border-b border-hairline py-5">
                    <div className="w-[92px] flex-none bg-paper p-1.5 shadow-thumb">
                      {r.image ? (
                        <ArtImage
                          {...imageProps(r.image, '')}
                          sizes="92px"
                          className="block aspect-[4/5] w-full object-cover"
                          style={{ objectPosition: objectPosition(r.image) }}
                        />
                      ) : (
                        <div className="aspect-[4/5] bg-sand" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex justify-between gap-2.5">
                        {r.slug ? (
                          <Link
                            href={`/shop/${r.slug}`}
                            onNavigate={close}
                            className="font-display text-[21px] leading-tight"
                          >
                            {r.title}
                          </Link>
                        ) : (
                          <span className="font-display text-[21px] leading-tight">{r.title}</span>
                        )}
                        <span className="font-display text-[19px]">
                          <PriceTag cents={r.unitPrice == null ? null : r.unitPrice * r.line.qty} />
                        </span>
                      </div>
                      <span className="text-[15px] text-muted">{r.label}</span>
                      {r.problem && (
                        <span className="text-[15px] text-mauve italic">{r.problem}</span>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        {r.line.type === 'print' ? (
                          <div
                            role="group"
                            aria-label={`Quantity of ${r.title}`}
                            className="inline-flex items-center rounded-xs border border-hairline-strong"
                          >
                            <button
                              type="button"
                              aria-label="Fewer"
                              disabled={r.line.qty <= 1}
                              onClick={() => setQty(key, r.line.qty - 1)}
                              className="size-10 border-0 bg-transparent text-xl text-ink disabled:opacity-40"
                            >
                              −
                            </button>
                            <span aria-live="polite" className="min-w-7 text-center text-[17px]">
                              {r.line.qty}
                            </span>
                            <button
                              type="button"
                              aria-label="More"
                              disabled={r.line.qty >= MAX_PRINT_QTY}
                              onClick={() => setQty(key, r.line.qty + 1)}
                              className="size-10 border-0 bg-transparent text-xl text-ink disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="text-[15px] text-mauve italic">one of a kind</span>
                        )}
                        <button
                          type="button"
                          onClick={() => remove(key)}
                          className="min-h-10 border-0 bg-transparent font-body text-[15px] text-muted underline"
                        >
                          Remove<span className="sr-only"> {r.title}</span>
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {resolved.length > 0 && (
          <div className="flex flex-col gap-2.5 border-t border-hairline bg-paper px-5 pt-[22px] pb-7 md:px-7">
            <div className="flex items-baseline justify-between">
              <span>Subtotal</span>
              <span className="font-display text-[28px]">
                <PriceTag cents={total} />
              </span>
            </div>
            <p className="m-0 text-[15px] text-muted">
              {blocked
                ? 'Please remove the pieces marked above to check out.'
                : 'Shipping is worked out at checkout.'}
            </p>
            {blocked ? (
              <span
                aria-disabled="true"
                className={cx(
                  buttonClasses({ size: 'lg', block: true }),
                  'mt-1 cursor-not-allowed opacity-60',
                )}
              >
                Checkout
              </span>
            ) : (
              <Link
                href="/checkout"
                prefetch
                onNavigate={close}
                className={cx(buttonClasses({ size: 'lg', block: true }), 'mt-1')}
              >
                Checkout
              </Link>
            )}
            <button
              type="button"
              onClick={close}
              className="flex min-h-10 items-center justify-center border-0 bg-transparent font-display text-lg text-mauve italic"
            >
              keep browsing
            </button>
          </div>
        )}
      </div>
    </dialog>
  )
}
