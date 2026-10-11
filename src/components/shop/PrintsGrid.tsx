'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FilterChips } from '@/components/FilterChips'
import { PrintOnTable } from '@/components/frames'
import { PriceTag } from '@/components/PriceTag'
import { imageProps } from '@/sanity/image'
import type { ArtworkCard } from '@/sanity/types'

type Filter = 'all' | 'painting' | 'digital'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'painting', label: 'From paintings' },
  { value: 'digital', label: 'Digital illustration' },
] as const

/** Prints as sheets of paper on a table, filterable by where they came from. */
export function PrintsGrid({
  prints,
  heading,
  details,
}: {
  prints: ArtworkCard[]
  heading: React.ReactNode
  /** The "Sizes A4, A3 & A2 · Archival inks…" strip under the header */
  details: React.ReactNode
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const shown = prints.filter((p) => filter === 'all' || p.kind === filter)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        {heading}
        <FilterChips label="Filter prints" value={filter} onChange={setFilter} options={FILTERS} />
      </div>
      {details}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] gap-x-8 gap-y-[52px] pt-11 max-sm:grid-cols-2 max-sm:gap-x-4 max-sm:gap-y-10">
        {shown.map((p) => (
          <article key={p._id} className="group relative flex flex-col gap-3.5">
            <PrintOnTable
              image={{
                ...imageProps(
                  p.image,
                  `Print of ${p.image.alt?.replace(/^(Oil painting|Illustration) of /, '') ?? p.title}`,
                ),
              }}
              sizes="(min-width: 1240px) 220px, (min-width: 640px) 30vw, 40vw"
            />
            <div className="flex items-baseline justify-between gap-2.5 max-sm:flex-col max-sm:gap-0.5">
              <div className="min-w-0">
                <h2 className="m-0 font-display text-xl leading-[1.2] font-normal sm:text-[23px]">
                  <Link
                    href={`/shop/${p.slug}?option=print`}
                    prefetch
                    className="text-ink group-hover:text-mauve after:absolute after:inset-0"
                  >
                    {p.title}
                  </Link>
                </h2>
                <p className="m-0 text-sm text-muted sm:text-[15px]">
                  {p.kind === 'digital' ? 'Digital illustration' : 'From an oil painting'}
                </p>
              </div>
              <p className="m-0 text-[15px] whitespace-nowrap sm:text-base">
                <PriceTag cents={p.printsFrom} from />
              </p>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
