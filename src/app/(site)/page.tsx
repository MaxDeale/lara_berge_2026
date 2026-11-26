import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArtImage } from '@/components/ArtImage'
import { ArtworkCard } from '@/components/ArtworkCard'
import { ButtonLink, InlineLink, TextLink } from '@/components/Button'
import { hoverZoom } from '@/components/frames'
import { LimbSigns } from '@/components/HangingSign'
import { Hero } from '@/components/Hero'
import { or } from '@/lib/artwork'
import { brand } from '@/lib/brand'
import { cx } from '@/lib/cx'
import { SITE_NAME } from '@/lib/site'
import { imageProps, objectPosition } from '@/sanity/image'
import { getArtworks, getSettings } from '@/sanity/queries'

export const metadata: Metadata = { alternates: { canonical: '/' } }

// Stagger of the digital strip, as in the designs
const STRIP_OFFSET = ['', 'mb-6 md:mb-10', '', 'md:mb-7', '']

export default async function HomePage() {
  const [settings, artworks] = await Promise.all([getSettings(), getArtworks()])
  const hero = settings.heroArtwork
  const paintings = artworks.filter((a) => a.kind === 'painting')
  const featured = paintings.filter((a) => a.featured)
  const newPaintings = (featured.length ? featured : paintings).slice(0, 3)
  const digital = artworks.filter((a) => a.kind === 'digital').slice(0, 5)
  const hello = settings.helloText?.length
    ? settings.helloText
    : ['[A few words from Lara about herself.]']

  return (
    <>
      {hero && (
        <Hero
          className="mx-auto max-w-[1360px] px-4 pt-2.5 md:px-6 md:pt-[30px]"
          motion={settings.heroMotion ?? 'drift-fireflies'}
          image={{
            ...imageProps(hero.image),
            objectPosition: objectPosition(hero.image, '50% 42%'),
          }}
          caption={
            <>
              <p className="m-0 text-[15px] text-muted md:hidden">
                <span className="font-display text-lg text-ink italic">{hero.title}</span> ·{' '}
                <InlineLink href={`/shop/${hero.slug}`}>see it</InlineLink>
              </p>
              <div className="flex flex-col items-center gap-0.5 max-md:hidden">
                <p className="m-0 font-display text-[22px] italic">{hero.title}</p>
                <p className="m-0 text-base text-muted">
                  {hero.kind === 'digital'
                    ? `${or(hero.medium, 'Digital illustration')} · `
                    : `${or(hero.medium, 'Oil on canvas')} · ${or(hero.dimensions, '[size]')} · `}
                  <InlineLink href={`/shop/${hero.slug}`}>
                    {hero.kind === 'digital' ? 'see the illustration' : 'see the painting'}
                  </InlineLink>
                </p>
              </div>
            </>
          }
        />
      )}

      {/* Lara asked for the welcome text to go (Nov 2026). It shows again if she fills in
          the Welcome fields in Studio. */}
      {settings.introHeading || settings.introText ? (
        <section
          aria-label="Introduction"
          className="mx-auto max-w-[760px] px-[22px] pt-14 text-center md:px-6 md:pt-24"
        >
          <h1 className="m-0 mb-3.5 font-display text-[36px] leading-[1.08] font-normal md:mb-[22px] md:text-[clamp(36px,5vw,58px)]">
            {settings.introHeading}{' '}
            {settings.introHeadingItalic && (
              <em className="text-mauve">{settings.introHeadingItalic}</em>
            )}
          </h1>
          {settings.introText && (
            <p className="m-0 mx-auto max-w-[560px] text-[17px] text-ink-soft md:text-xl">
              {settings.introText}
            </p>
          )}
        </section>
      ) : (
        <h1 className="sr-only">{SITE_NAME}</h1>
      )}

      <section
        aria-label="Wander in"
        className="relative mx-auto max-w-[1160px] pt-10 md:px-6 md:pt-16"
      >
        {/* Each string meets the bark where it hangs: the limb rises to the right */}
        <LimbSigns
          className="[--sign-w:27cqw] md:[--sign-w:min(19cqw,210px)]"
          signWidth="var(--sign-w)"
          signs={[
            { sign: brand.signs.gallery, alt: 'Gallery', href: '/gallery', at: 0.2, delay: -1.5 },
            { sign: brand.signs.shop, alt: 'Shop', href: '/shop', at: 0.5, delay: -3.2 },
            { sign: brand.signs.about, alt: 'About', href: '/about', at: 0.8, delay: -4.6 },
          ]}
        />
      </section>

      {newPaintings.length > 0 && (
        <section
          aria-labelledby="latest-h"
          className="mx-auto max-w-[1120px] pt-16 md:px-6 md:pt-[104px]"
        >
          <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-3 px-[22px] md:mb-9 md:items-end md:px-0">
            <div>
              <h2
                id="latest-h"
                className="m-0 font-display text-[30px] leading-[1.1] font-normal md:text-[40px]"
              >
                New paintings
              </h2>
            </div>
            <TextLink href="/gallery" aria-label="All paintings">
              <span className="md:hidden">all →</span>
              <span className="max-md:hidden">all paintings →</span>
            </TextLink>
          </div>
          <div className="flex snap-x snap-mandatory scroll-px-[22px] [scrollbar-width:none] gap-4 overflow-x-auto px-[22px] pb-2.5 md:grid md:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] md:gap-x-10 md:gap-y-12 md:overflow-visible md:px-0 md:pb-0">
            {newPaintings.map((p) => (
              <ArtworkCard
                key={p._id}
                artwork={p}
                sizes="(min-width: 1120px) 340px, (min-width: 768px) 30vw, 230px"
                className="shrink-0 basis-[250px] snap-start md:basis-auto"
              />
            ))}
          </div>
        </section>
      )}

      {newPaintings.length === 0 && (
        <section
          aria-labelledby="classes-h"
          className="mx-auto max-w-[1120px] px-[22px] pt-16 md:px-6 md:pt-[104px]"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6 border-y border-hairline py-10 md:py-14">
            <div className="flex flex-[1_1_460px] items-center gap-[22px]">
              <Image
                src={brand.doodads.catBooks}
                alt=""
                className="block h-auto w-[84px] flex-none max-md:hidden"
              />
              <div>
                <h2
                  id="classes-h"
                  className="m-0 mb-2 font-display text-[30px] leading-[1.1] font-normal md:text-[40px]"
                >
                  Classes
                </h2>
                <p className="m-0 text-[17px] text-ink-soft">
                  Learn oil painting or digital illustration with me, online through Preply or in
                  private classes.
                </p>
              </div>
            </div>
            <ButtonLink href="/classes" className="max-md:min-h-[52px] max-md:w-full">
              See the classes
            </ButtonLink>
          </div>
        </section>
      )}

      {digital.length > 0 && (
        <section
          aria-labelledby="digital-h"
          className="mx-auto mt-14 max-w-[1360px] md:mt-[120px] md:px-6"
        >
          <div className="mx-auto mb-[18px] flex max-w-[1120px] flex-wrap items-end justify-between gap-x-8 gap-y-3 px-[22px] md:mb-8 md:px-0">
            <div className="flex items-end gap-[18px]">
              <Image
                src={brand.doodads.shroom}
                alt=""
                className="-mb-1.5 block h-auto w-[78px] max-md:hidden"
              />
              <h2
                id="digital-h"
                className="m-0 font-display text-[30px] leading-[1.1] font-normal md:text-[40px]"
              >
                Digital illustration
              </h2>
            </div>
          </div>
          <div className="strip flex snap-x snap-mandatory scroll-px-[22px] items-end gap-3.5 overflow-x-auto px-[22px] pt-2 pb-2.5 md:snap-none md:gap-[22px] md:px-0 md:pb-[18px]">
            {digital.map((d, i) => (
              <Link
                key={d._id}
                href={`/gallery/${d.slug}`}
                prefetch
                className={cx(
                  'group block shrink-0 basis-[170px] snap-start overflow-hidden md:basis-[clamp(190px,21%,280px)]',
                  STRIP_OFFSET[i],
                )}
              >
                <ArtImage
                  {...imageProps(d.image)}
                  sizes="(min-width: 768px) 280px, 170px"
                  className={cx('block h-auto w-full', hoverZoom)}
                />
              </Link>
            ))}
          </div>
          <div className="mx-auto mt-3.5 max-w-[1120px] px-[22px] max-md:hidden md:px-0">
            <TextLink href="/gallery?tab=digital">see all digital work →</TextLink>
          </div>
        </section>
      )}

      <section
        aria-labelledby="hello-h"
        className="mx-auto flex max-w-[1000px] flex-col items-center gap-x-16 gap-y-2.5 px-[22px] pt-16 text-center md:flex-row md:flex-wrap md:justify-center md:gap-y-10 md:px-6 md:pt-[120px] md:text-left"
      >
        {settings.portrait && (
          <ArtImage
            {...imageProps(settings.portrait)}
            sizes="(min-width: 768px) 340px, 230px"
            className="block h-auto w-[230px] max-w-full mix-blend-multiply md:w-[340px] md:flex-[0_1_340px]"
          />
        )}
        <div className="min-w-0 md:flex-[1_1_380px]">
          <h2
            id="hello-h"
            className="m-0 mb-2.5 font-display text-[32px] leading-[1.1] font-normal md:mb-3.5 md:text-[40px]"
          >
            Hello, I&apos;m Lara
          </h2>
          {hello.map((p, i) => (
            <p
              key={i}
              className={cx(
                'm-0 text-ink-soft',
                i === hello.length - 1 ? 'mb-5 md:mb-[22px]' : 'mb-3.5',
                i > 0 && 'max-md:hidden',
              )}
            >
              {p}
            </p>
          ))}
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <ButtonLink href="/commissions" className="max-md:min-h-[52px] max-md:w-full">
              Commission a piece
            </ButtonLink>
            <TextLink href="/about" className="max-md:hidden">
              more about me →
            </TextLink>
          </div>
        </div>
      </section>
    </>
  )
}
