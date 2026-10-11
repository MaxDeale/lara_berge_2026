import type { Metadata } from 'next'
import Image from 'next/image'
import { ArtImage } from '@/components/ArtImage'
import { ButtonLink, TextLink } from '@/components/Button'
import { Eyebrow } from '@/components/Eyebrow'
import { ArchFrame } from '@/components/frames'
import { BranchSign } from '@/components/HangingSign'
import { RichText } from '@/components/RichText'
import { or } from '@/lib/artwork'
import { brand } from '@/lib/brand'
import { JsonLd, personJsonLd } from '@/lib/seo'
import { imageProps, objectPosition } from '@/sanity/image'
import { getSettings } from '@/sanity/queries'

export const metadata: Metadata = {
  alternates: { canonical: '/about' },
  title: 'About',
  description: 'Lara Berge paints small enchanted worlds in oil, and draws digital illustrations.',
}

export default async function AboutPage() {
  const s = await getSettings()
  const notes = s.studioNotes?.length ? s.studioNotes : [{ label: '[label]', text: '[note]' }]

  return (
    <>
      <JsonLd data={personJsonLd(s)} />
      <section className="mx-auto max-w-[760px] px-6 pt-9 text-center">
        <BranchSign image={brand.signs.about} />
      </section>

      <section
        aria-labelledby="about-h"
        className="mx-auto flex max-w-[1120px] flex-wrap items-start gap-x-20 gap-y-12 px-6 pt-16"
      >
        <figure className="m-0 min-w-0 flex-[0_1_420px]">
          <ArchFrame>
            {s.aboutPhoto ? (
              <ArtImage
                {...imageProps(s.aboutPhoto)}
                sizes="(min-width: 768px) 420px, 90vw"
                preload
                className="block aspect-[3/4] w-full object-cover"
                style={{ objectPosition: objectPosition(s.aboutPhoto) }}
              />
            ) : (
              <div className="aspect-[3/4]" />
            )}
          </ArchFrame>
          <figcaption className="mt-3 text-center text-base text-muted italic">
            {or(s.aboutPhotoCaption, '[caption]')}
          </figcaption>
        </figure>
        <div className="min-w-0 flex-[1_1_440px] pt-3 leading-[1.65]">
          <Eyebrow className="mb-1.5">{or(s.aboutEyebrow, 'the long version')}</Eyebrow>
          <h1
            id="about-h"
            className="m-0 mb-[22px] font-display text-[40px] leading-[1.05] font-normal md:text-[52px]"
          >
            {or(s.aboutHeading, "Hello, I'm Lara")}
          </h1>
          <RichText
            value={s.aboutBody}
            className="mb-7 text-ink-soft [&>p:first-child]:first-letter:float-left [&>p:first-child]:first-letter:pt-1.5 [&>p:first-child]:first-letter:pr-2.5 [&>p:first-child]:first-letter:font-display [&>p:first-child]:first-letter:text-[74px] [&>p:first-child]:first-letter:leading-[0.8] [&>p:first-child]:first-letter:text-mauve"
          />
          <div className="flex flex-wrap items-center gap-x-[26px] gap-y-3">
            <ButtonLink href="/commissions">Commission a piece</ButtonLink>
            <TextLink href="/contact">or just say hello →</TextLink>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="notes-h"
        className="relative mx-auto max-w-[1120px] px-6 pt-20 md:pt-[110px]"
      >
        <div className="flex flex-wrap items-end gap-x-14 gap-y-8">
          <Image src={brand.doodads.catBooks} alt="" className="block h-auto w-[120px] flex-none" />
          <div className="min-w-0 flex-[1_1_600px]">
            <h2 id="notes-h" className="m-0 mb-6 font-display text-4xl font-normal">
              Studio notes
            </h2>
            <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-10 gap-y-7 border-t border-hairline pt-[26px]">
              {notes.map((n, i) => (
                <div key={i}>
                  <Eyebrow as="dt" tracking="tight" className="md:text-[15px]">
                    {or(n.label, '[label]')}
                  </Eyebrow>
                  <dd className="mt-1 mb-0 ml-0">{or(n.text, '[note]')}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  )
}
