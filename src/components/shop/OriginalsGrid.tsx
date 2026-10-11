'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArtImage } from '@/components/ArtImage'
import { FilterChips } from '@/components/FilterChips'
import { hoverZoom, Mat } from '@/components/frames'
import { PriceTag } from '@/components/PriceTag'
import { originalSold } from '@/lib/artwork'
import { cx } from '@/lib/cx'
import { imageProps, objectPosition } from '@/sanity/image'
import type { ArtworkCard } from '@/sanity/types'

type Filter = 'all' | 'available' | 'sold'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
] as const

/** Originals list. Sold pieces stay visible and point to their prints. */
export function OriginalsGrid({
  originals,
  slots,
  heading,
}: {
  originals: ArtworkCard[]
  slots: number
  /** Title and intro, server-rendered, shown left of the filters */
  heading: React.ReactNode
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const shown = originals.filter((p) =>
    filter === 'all' ? true : filter === 'sold' ? originalSold(p) : !originalSold(p),
  )
  const showSlots = filter !== 'sold' ? slots : 0

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5 border-b border-hairline pb-6">
        {heading}
        <FilterChips
          label="Filter paintings"
          value={filter}
          onChange={setFilter}
          options={FILTERS}
        />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-x-11 gap-y-14 pt-11">
        {shown.map((p) => {
          const sold = originalSold(p)
          const reserved = p.original?.status === 'reserved'
          return (
            <article key={p._id} className="group relative flex flex-col gap-3.5">
              <div className="relative">
                <Mat>
                  <ArtImage
                    {...imageProps(p.image)}
                    sizes="(min-width: 1180px) 360px, (min-width: 768px) 45vw, 90vw"
                    className={cx(
                      'block aspect-[4/5] w-full object-cover',
                      hoverZoom,
                      sold && 'saturate-[.85]',
                    )}
                    style={{ objectPosition: objectPosition(p.image) }}
                  />
                </Mat>
                {(sold || reserved) && (
                  <span className="absolute top-[22px] left-[22px] rounded-xs bg-paper px-3 py-1 font-sc text-sm tracking-[0.16em] text-ink md:top-[26px] md:left-[26px]">
                    {sold ? 'sold' : 'reserved'}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="m-0 font-display text-[25px] leading-[1.2] font-normal">
                    <Link
                      href={`/shop/${p.slug}`}
                      prefetch
                      className="text-ink group-hover:text-mauve after:absolute after:inset-0"
                    >
                      {p.title}
                    </Link>
                  </h2>
                  <p className="m-0 text-base text-muted">
                    {p.medium ?? 'Oil on canvas'} · {p.dimensions ?? '[W × H cm]'}
                  </p>
                </div>
                <p className="m-0 font-display text-[21px] whitespace-nowrap">
                  {sold ? 'Sold' : <PriceTag cents={p.original?.price} />}
                </p>
              </div>
              {sold && p.hasPrints && (
                <Link
                  href={`/shop/${p.slug}?option=print`}
                  className="relative z-1 -mt-1.5 text-base text-mauve"
                >
                  prints of this painting →
                </Link>
              )}
            </article>
          )
        })}
        {Array.from({ length: showSlots }, (_, i) => (
          <article key={`slot-${i}`} aria-hidden="true" className="flex flex-col gap-3.5">
            <div className="flex aspect-[4/5] items-center justify-center border border-dashed border-chip bg-paper text-[17px] text-muted italic">
              [Next painting]
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="m-0 font-display text-[25px] leading-[1.2]">[Title]</p>
                <p className="m-0 text-base text-muted">Oil on canvas · [size]</p>
              </div>
              <p className="m-0 font-display text-[21px]">R[price]</p>
            </div>
          </article>
        ))}
        {shown.length === 0 && showSlots === 0 && (
          <p className="col-span-full text-center text-ink-soft italic">Nothing here just yet.</p>
        )}
      </div>
    </>
  )
}
