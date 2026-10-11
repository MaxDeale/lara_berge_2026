import type { Metadata } from 'next'
import Link from 'next/link'
import { ArtImage } from '@/components/ArtImage'
import { ArchFrame } from '@/components/frames'
import { BranchSign } from '@/components/HangingSign'
import { formatZAR } from '@/lib/format'
import { brand } from '@/lib/brand'
import { imageProps, objectPosition } from '@/sanity/image'
import { getArtworks, getSettings } from '@/sanity/queries'
import type { SanityImg } from '@/sanity/types'

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'One-of-a-kind oil paintings, signed fine art prints, and commissions by Lara Berge.',
}

const STEPS = [
  ['i', 'Choose your piece', 'An original, a print in your size, or a commission quote.'],
  ['ii', 'Pay securely', 'Through PayFast, by card, Instant EFT or SnapScan.'],
  ['iii', 'Wrapped & sent', 'Packed by hand and couriered with tracking, in SA and abroad.'],
] as const

export default async function ShopPage() {
  const [s, artworks] = await Promise.all([getSettings(), getArtworks()])
  const prices = artworks.flatMap((a) => (typeof a.printsFrom === 'number' ? [a.printsFrom] : []))
  const printsFrom = prices.length ? formatZAR(Math.min(...prices)) : 'R[price]'

  const doors = [
    {
      href: '/shop/originals',
      title: 'Original paintings',
      text: 'The one and only. Oil on canvas, signed on the back.',
      cta: 'browse originals',
      image: s.shopOriginalsImage,
    },
    {
      href: '/shop/prints',
      title: 'Fine art prints',
      text: `Paintings and digital pieces on archival paper, from ${printsFrom}.`,
      cta: 'browse prints',
      image: s.shopPrintsImage,
    },
    {
      href: '/commissions',
      title: 'Commissions',
      text: 'Your idea, painted in oil or drawn digitally.',
      cta: 'start a commission',
      image: s.shopCommissionsImage,
    },
  ]

  return (
    <>
      <section className="mx-auto max-w-[760px] px-6 pt-9 text-center">
        <BranchSign image={brand.signs.shop} />
        <h1 className="mt-[30px] mb-2 font-display text-[36px] leading-[1.1] font-normal md:text-[44px]">
          Take a little world home
        </h1>
        <p className="mx-auto my-0 max-w-[540px] text-ink-soft">
          One-of-a-kind oil paintings, signed fine art prints, and commissions made just for you.
          Everything is wrapped by hand.
        </p>
      </section>

      <section aria-label="Ways to buy" className="mx-auto max-w-[1180px] px-6 pt-16 md:pt-[72px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-x-10 gap-y-12">
          {doors.map((door) => (
            <Link
              key={door.href}
              href={door.href}
              className="group flex flex-col gap-[18px] text-center"
            >
              <Door image={door.image} />
              <div>
                <h2 className="m-0 font-display text-[28px] font-normal md:text-[32px]">
                  {door.title}
                </h2>
                <p className="mt-0.5 mb-1.5 text-[17px] text-ink-soft">{door.text}</p>
                <span className="font-display text-[19px] text-mauve italic">
                  {door.cta}{' '}
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="how-h" className="mx-auto max-w-[1120px] px-6 pt-24 md:pt-[120px]">
        <h2
          id="how-h"
          className="m-0 mb-9 text-center font-display text-[30px] font-normal md:text-4xl"
        >
          How buying works
        </h2>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-12 gap-y-9 p-0">
          {STEPS.map(([n, title, text]) => (
            <li key={n} className="flex flex-col items-center gap-2 text-center">
              <span
                aria-hidden="true"
                className="flex size-14 items-center justify-center rounded-full border border-mauve-pale font-display text-[26px] text-mauve"
              >
                {n}
              </span>
              <h3 className="m-0 font-display text-2xl font-normal">{title}</h3>
              <p className="m-0 text-[17px] text-ink-soft">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-11 mb-0 text-center text-[17px] text-ink-soft">
          Questions about framing, sizes or delivery?{' '}
          <Link href="/faq" className="border-b border-mauve-pale text-mauve">
            Read the FAQ
          </Link>
        </p>
      </section>
    </>
  )
}

function Door({ image }: { image?: SanityImg | null }) {
  return (
    <ArchFrame className="rounded-[200px_200px_3px_3px]">
      {image ? (
        <ArtImage
          {...imageProps(image, '')}
          sizes="(min-width: 1180px) 360px, (min-width: 768px) 30vw, 90vw"
          className="block aspect-[3/4] w-full object-cover transition-transform duration-800 ease-story group-hover:scale-105"
          style={{ objectPosition: objectPosition(image, '50% 20%') }}
        />
      ) : (
        <div className="aspect-[3/4]" />
      )}
    </ArchFrame>
  )
}
