import Image from 'next/image'
import Link from 'next/link'
import { ArtImage } from '@/components/ArtImage'
import { ArtworkCard } from '@/components/ArtworkCard'
import { Branch } from '@/components/Branch'
import { ButtonLink, InlineLink, TextLink } from '@/components/Button'
import { Eyebrow } from '@/components/Eyebrow'
import { hoverZoom } from '@/components/frames'
import { HangingSign } from '@/components/HangingSign'
import { Hero } from '@/components/Hero'
import { or } from '@/lib/artwork'
import { brand } from '@/lib/brand'
import { cx } from '@/lib/cx'
import { imageProps, objectPosition } from '@/sanity/image'
import { getArtworks, getSettings } from '@/sanity/queries'

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
                  {or(hero.medium, 'Oil on canvas')} · {or(hero.dimensions, '[size]')} ·{' '}
                  <InlineLink href={`/shop/${hero.slug}`}>see the painting</InlineLink>
                </p>
              </div>
            </>
          }
        />
      )}

      <section
        aria-label="Introduction"
        className="mx-auto max-w-[760px] px-[22px] pt-14 text-center md:px-6 md:pt-24"
      >
        <h1 className="m-0 mb-3.5 font-display text-[36px] leading-[1.08] font-normal md:mb-[22px] md:text-[clamp(36px,5vw,58px)]">
          {or(settings.introHeading, 'Small enchanted worlds,')}{' '}
          <em className="text-mauve">{or(settings.introHeadingItalic, 'painted by hand')}</em>
        </h1>
        <p className="m-0 mx-auto max-w-[560px] text-[17px] text-ink-soft md:text-xl">
          {or(settings.introText, '[A line or two about the work.]')}
        </p>
      </section>

      <section
        aria-label="Wander in"
        className="relative mx-auto max-w-[1160px] pt-[52px] md:px-6 md:pt-[84px]"
      >
        <Branch variant="wide" className="relative z-2" />
        <div className="relative z-1 -mt-[26px] flex justify-around px-2 md:-mt-[58px] md:flex-wrap md:justify-center md:gap-x-[9%] md:gap-y-6 md:px-0">
          <HangingSign
            image={brand.signs.gallery}
            alt="Gallery"
            href="/gallery"
            width="clamp(104px, 18vw, 210px)"
            delay={-1.5}
          />
          <HangingSign
            image={brand.signs.shop}
            alt="Shop"
            href="/shop"
            width="clamp(104px, 18vw, 210px)"
            delay={-3.2}
            className="md:mt-2.5"
          />
          <HangingSign
            image={brand.signs.about}
            alt="About"
            href="/about"
            width="clamp(104px, 18vw, 210px)"
            delay={-4.6}
            className="md:mt-0.5"
          />
        </div>
      </section>

      {newPaintings.length > 0 && (
        <section
          aria-labelledby="latest-h"
          className="mx-auto max-w-[1120px] pt-16 md:px-6 md:pt-[104px]"
        >
          <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-3 px-[22px] md:mb-9 md:items-end md:px-0">
            <div>
              <Eyebrow className="mb-1 max-md:hidden">fresh off the easel</Eyebrow>
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
                className="shrink-0 basis-[250px] snap-start md:basis-auto"
              />
            ))}
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
              <div>
                <Eyebrow className="mb-0 md:mb-1">pixels &amp; ink</Eyebrow>
                <h2
                  id="digital-h"
                  className="m-0 font-display text-[30px] leading-[1.1] font-normal md:text-[40px]"
                >
                  Digital illustration
                </h2>
              </div>
            </div>
            <p className="m-0 max-w-[430px] text-[17px] text-ink-soft max-md:hidden">
              Witches, stags, octopuses with lanterns and one very patient bear. Order a print, or
              commission an illustration of your own.
            </p>
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
