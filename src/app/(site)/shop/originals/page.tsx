import type { Metadata } from 'next'
import Image from 'next/image'
import { Breadcrumb } from '@/components/Breadcrumb'
import { ButtonLink } from '@/components/Button'
import { OriginalsGrid } from '@/components/shop/OriginalsGrid'
import { brand } from '@/lib/brand'
import { getArtworks } from '@/sanity/queries'

export const metadata: Metadata = {
  title: 'Original paintings',
  description:
    'One-of-a-kind oil paintings by Lara Berge, signed and sent with a certificate of authenticity.',
}

const MIN_TILES = 6

export default async function OriginalsPage() {
  const originals = (await getArtworks()).filter(
    (a) => a.kind === 'painting' && a.original?.forSale,
  )

  return (
    <div className="mx-auto max-w-[1180px] px-6 pt-10">
      <Breadcrumb
        className="mb-[18px]"
        items={[{ label: 'Shop', href: '/shop' }, { label: 'Originals' }]}
      />
      <OriginalsGrid
        originals={originals}
        slots={Math.max(0, MIN_TILES - originals.length)}
        heading={
          <div>
            <h1 className="m-0 font-display text-[40px] leading-[1.05] font-normal md:text-[52px]">
              Original paintings
            </h1>
            <p className="mt-2 mb-0 max-w-[560px] text-ink-soft">
              Each one exists exactly once. Oil on canvas, signed on the back, and sent with a
              handwritten certificate of authenticity.
            </p>
          </div>
        }
      />

      <aside className="mt-24 flex flex-wrap items-center justify-between gap-x-10 gap-y-6 border border-hairline bg-paper p-7 md:p-10">
        <div className="flex flex-[1_1_520px] items-center gap-[22px]">
          <Image src={brand.doodads.shroom} alt="" className="block h-auto w-[70px]" />
          <div>
            <h2 className="m-0 mb-1 font-display text-[26px] font-normal md:text-[28px]">
              Missed the one you loved?
            </h2>
            <p className="m-0 text-[17px] text-ink-soft">
              Lara can paint something in the same spirit, just for you.
            </p>
          </div>
        </div>
        <ButtonLink href="/commissions">Start a commission</ButtonLink>
      </aside>
    </div>
  )
}
