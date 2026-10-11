import './globals.css'
import type { Metadata } from 'next'
import Image from 'next/image'
import { Branch } from '@/components/Branch'
import { ButtonLink, TextLink } from '@/components/Button'
import { Spider } from '@/components/Spider'
import { brand } from '@/lib/brand'

export const metadata: Metadata = { title: 'Page not found' }

/** 404: the spider drops in on its thread. Used for unknown URLs and missing artworks. */
export default function NotFound() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-cream text-ink">
      <div className="pointer-events-none absolute -top-2.5 -left-10 w-[calc(100%+80px)] md:-top-5">
        <Branch variant="wide" />
      </div>
      <Spider
        motion="drop"
        eyes
        thread={220}
        size={52}
        className="absolute top-6 left-[66%] md:top-10 md:left-[62%]"
      />

      <div className="relative flex flex-col items-center px-6 pt-[260px] pb-48 text-center md:pt-[300px]">
        <p className="m-0 font-sc text-base tracking-[0.3em] text-mauve md:text-lg">error 404</p>
        <h1 className="mt-1.5 mb-3.5 font-display text-[44px] leading-none font-normal md:text-[72px]">
          This path leads nowhere
        </h1>
        <p className="m-0 mb-[30px] max-w-[480px] text-lg text-ink-soft md:text-xl">
          Even the spider got lost on this one. Let&apos;s get you back somewhere with paintings.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3.5">
          <ButtonLink href="/" className="min-h-[50px] px-7">
            Take me home
          </ButtonLink>
          <TextLink href="/gallery">or wander the gallery →</TextLink>
        </div>
      </div>

      <Image
        src={brand.doodads.shroom}
        alt=""
        className="absolute bottom-6 left-6 h-auto w-[90px] md:bottom-[30px] md:left-[90px] md:w-[120px]"
      />
      <Image
        src={brand.doodads.galCat}
        alt=""
        className="cat absolute right-6 bottom-8 h-auto w-[110px] md:right-[110px] md:bottom-10 md:w-[150px]"
      />
    </main>
  )
}
