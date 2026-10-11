import type { Metadata } from 'next'
import { ButtonLink, TextLink } from '@/components/Button'
import { GalleryView } from '@/components/gallery/GalleryView'
import { BranchSign } from '@/components/HangingSign'
import { brand } from '@/lib/brand'
import { getArtworks } from '@/sanity/queries'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Oil paintings and digital illustrations by Lara Berge.',
}

const MIN_PAINTING_TILES = 6

export default async function GalleryPage() {
  const artworks = await getArtworks()
  const paintings = artworks.filter((a) => a.kind === 'painting')
  const digital = artworks.filter((a) => a.kind === 'digital')

  return (
    <>
      <section aria-labelledby="gal-h" className="mx-auto max-w-[760px] px-6 pt-9 text-center">
        <h1 id="gal-h" className="sr-only">
          Gallery
        </h1>
        <BranchSign image={brand.signs.gallery} />
        <p className="mx-auto mt-[26px] mb-0 max-w-[540px] text-ink-soft">
          Oil paintings, and digital illustrations drawn with a stylus. Tap any piece to see it up
          close.
        </p>
      </section>

      <section aria-label="Gallery sections" className="mx-auto max-w-[1240px] px-6 pt-12">
        <GalleryView
          paintings={paintings}
          digital={digital}
          slots={Math.max(0, MIN_PAINTING_TILES - paintings.length)}
        />
      </section>

      <section aria-labelledby="cta-h" className="mx-auto mt-20 max-w-[1120px] px-6 md:mt-[110px]">
        <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6 border-y border-hairline py-14">
          <div className="flex-[1_1_420px]">
            <h2
              id="cta-h"
              className="m-0 mb-2 font-display text-[30px] leading-[1.15] font-normal md:text-4xl"
            >
              Fallen for something?
            </h2>
            <p className="m-0 text-ink-soft">
              Most pieces come as signed fine art prints, and Lara takes commissions in both oil and
              digital.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="/shop/prints">Shop prints</ButtonLink>
            <TextLink href="/commissions">commission a piece →</TextLink>
          </div>
        </div>
      </section>
    </>
  )
}
